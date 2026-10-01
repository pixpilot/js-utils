import type { UtilityRegistry } from './types';
import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  findUtilities,
  importStatement,
  installCommand,
  listPackages,
  sharedScope,
} from './registry';
import { queryTerms, searchUtilities } from './search';

const MAX_SEARCH_LIMIT = 50;
const SUGGESTION_LIMIT = 3;

/** Options for {@link createMcpServer}. */
export interface McpServerOptions {
  /** Name reported to MCP clients, e.g. `acme-utils`. */
  name: string;
  version: string;
  /** Generated registry (see `asRegistry`). */
  registry: UtilityRegistry;
  /**
   * First paragraph of the instructions: what the catalog covers. Default: lists
   * the registry's categories. Ignored when `instructions` is set.
   */
  summary?: string;
  /** Replaces the whole instructions text sent to clients. */
  instructions?: string;
}

function catalogLabel(registry: UtilityRegistry): string {
  const scope = sharedScope(registry.packages);
  return scope === undefined ? 'utility packages' : `${scope} utility packages`;
}

/**
 * Instructions sent to MCP clients: what the catalog covers, when to consult
 * it, and the search -> details workflow.
 */
export function buildInstructions(registry: UtilityRegistry, summary?: string): string {
  const categories = [...new Set(registry.packages.map((pkg) => pkg.category))];
  const intro =
    summary ??
    `Catalog of the ${catalogLabel(registry)} (${registry.packages.length} packages): ${categories.join(', ')}.`;

  return `${intro}

Consult it BEFORE hand-writing a small general-purpose helper, then install and import the package that already provides it.

Workflow: \`search_utilities\` with a short task description -> \`get_utility_details\` for the exact signature, parameters, examples, import statement, and install command. \`list_packages\` gives a one-screen overview. Respect \`runtime\`: "node" utilities must not be used in browser code. Install with the project's package manager.`;
}

/** `e.g. "@acme/date", "date", or "@acme/env/node"` for the package filter description. */
function packageFilterExample(registry: UtilityRegistry): string {
  const [first] = registry.packages;

  if (!first) {
    return '';
  }

  const [subpath] = registry.packages.flatMap((pkg) =>
    pkg.entryPoints.filter((entry) => entry.importPath !== pkg.name),
  );
  const examples = [first.name, first.name.split('/').at(-1), subpath?.importPath]
    .filter((example): example is string => example !== undefined)
    .map((example) => `"${example}"`);

  return ` e.g. ${examples.join(', ')}`;
}

function jsonResult<TData extends Record<string, unknown>>(data: TData) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data) }],
    structuredContent: data,
  };
}

function errorResult(text: string) {
  return { content: [{ type: 'text' as const, text }], isError: true };
}

/** Creates an MCP server exposing `list_packages`, `search_utilities`, and `get_utility_details`. */
export function createMcpServer(options: McpServerOptions): McpServer {
  const { name, version, registry } = options;
  const label = catalogLabel(registry);
  const server = new McpServer(
    { name, version },
    {
      instructions: options.instructions ?? buildInstructions(registry, options.summary),
    },
  );

  server.registerTool(
    'list_packages',
    {
      title: `List ${label}`,
      description: `One row per package in the ${label}: description, category, entry points with their runtime, utility count, and install command. Use it to browse by domain; use search_utilities to find a specific helper.`,
    },
    async () => jsonResult({ packages: listPackages(registry.packages) }),
  );

  server.registerTool(
    'search_utilities',
    {
      title: 'Search utilities',
      description: `Find utilities in the ${label} by what they do, in a few words, or by name. Returns compact matches ranked by relevance: name, package, import path, runtime, signature, one-line summary, and the query terms each matched. \`unmatchedTerms\` lists query words no result covers. An empty query with \`package\` lists that package.`,
      inputSchema: {
        query: z
          .string()
          .describe('Task description or utility name. Empty lists utilities.'),
        package: z
          .string()
          .optional()
          .describe(
            `Limit to one package or import path,${packageFilterExample(registry)}.`,
          ),
        kind: z.enum(['function', 'constant', 'type']).optional(),
        runtime: z
          .enum(['universal', 'node', 'browser'])
          .optional()
          .describe(
            'Where the code runs; "browser" or "node" also include universal utilities.',
          ),
        limit: z.number().int().min(1).max(MAX_SEARCH_LIMIT).optional(),
      },
    },
    async ({ query, ...searchOptions }) => {
      const results = searchUtilities(registry.utilities, query, searchOptions);

      if (results.length === 0) {
        return jsonResult({
          results,
          hint: 'No matches. Try fewer or different words, or call list_packages.',
        });
      }

      // Words no result covers: tells the client the catalog lacks that part of the task.
      const unmatchedTerms = queryTerms(query).filter(
        (term) => !results.some((result) => result.matchedTerms?.includes(term)),
      );

      return jsonResult({
        results,
        ...(unmatchedTerms.length > 0
          ? {
              unmatchedTerms,
              hint: `No result matches ${unmatchedTerms.map((term) => `"${term}"`).join(', ')}: these are partial matches, so check that one fits before using it.`,
            }
          : {}),
      });
    },
  );

  server.registerTool(
    'get_utility_details',
    {
      title: 'Get utility details',
      description:
        'Full documentation for one utility: signatures with parameter and return types, option object properties, examples, notes, runtime, import statement, and install command.',
      inputSchema: {
        name: z.string().min(1).describe('Exact exported name.'),
        package: z
          .string()
          .optional()
          .describe(
            'Package or import path, only needed when the name exists in several packages.',
          ),
      },
    },
    async ({ name: utilityName, package: packageFilter }) => {
      const matches = findUtilities(registry.utilities, utilityName, packageFilter);

      if (matches.length === 0) {
        const suggestions = searchUtilities(registry.utilities, utilityName, {
          limit: SUGGESTION_LIMIT,
          package: packageFilter,
        }).map((result) => `${result.name} (${result.importPath})`);

        const scope = packageFilter === undefined ? '' : ` in ${packageFilter}`;
        const didYouMean =
          suggestions.length > 0 ? ` Did you mean: ${suggestions.join(', ')}?` : '';

        return errorResult(
          `Utility "${utilityName}" was not found${scope}.${didYouMean} Use search_utilities to find it.`,
        );
      }

      const [utility, ...others] = matches;

      if (!utility || others.length > 0) {
        return errorResult(
          `"${utilityName}" exists in several packages: ${matches
            .map((match) => match.importPath)
            .join(', ')}. Pass \`package\` to pick one.`,
        );
      }

      return jsonResult({
        utility: {
          ...utility,
          import: importStatement(utility),
          install: installCommand(utility.package),
        },
      });
    },
  );

  return server;
}

/** Starts the MCP server over stdio. Call it from the package's bin entrypoint. */
export async function startMcpServer(options: McpServerOptions): Promise<void> {
  try {
    const server = createMcpServer(options);
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to start ${options.name} MCP server: ${message}`);
    process.exit(1);
  }
}
