import type { UtilityRegistry } from './types';
import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  registry as defaultRegistry,
  findUtilities,
  importStatement,
  installCommand,
  listPackages,
} from './registry';
import { searchUtilities } from './search';

/** Name reported to MCP clients. */
export const SERVER_NAME = 'pixpilot-js-utils';

/** Server-level description. Kept explicit about *when* to consult this server. */
export const SERVER_INSTRUCTIONS = `Catalog of the @pixpilot JavaScript/TypeScript utility packages: strings and case conversion, arrays, objects (deep merge, dot paths, key casing), dates, numbers, money formatting, pagination, env/.env loading, DOM z-index, GUID checks, hashing, and finding project roots.

Consult it BEFORE hand-writing a small general-purpose helper in a JS/TS project, then install and import the package that already provides it.

Workflow: \`search_utilities\` with a short task description (e.g. "end of month", "camelCase object keys", "load .env in a monorepo") -> \`get_utility_details\` for the exact signature, parameters, examples, import statement, and install command. \`list_packages\` gives a one-screen overview. Respect \`runtime\`: "node" utilities must not be used in browser code. Install with the project's package manager.`;

const MAX_SEARCH_LIMIT = 50;
const SUGGESTION_LIMIT = 3;

/** Options for {@link createServer}. */
export interface CreateServerOptions {
  version: string;
  /** Registry to serve; defaults to the generated one. Useful for tests. */
  registry?: UtilityRegistry;
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

/** Creates the MCP server and registers the package/search/detail tools. */
export function createServer({
  version,
  registry = defaultRegistry,
}: CreateServerOptions): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version },
    { instructions: SERVER_INSTRUCTIONS },
  );

  server.registerTool(
    'list_packages',
    {
      title: 'List @pixpilot utility packages',
      description:
        'One row per @pixpilot utility package: description, category, entry points with their runtime, utility count, and install command. Use it to browse by domain; use search_utilities to find a specific helper.',
    },
    async () => jsonResult({ packages: listPackages(registry.packages) }),
  );

  server.registerTool(
    'search_utilities',
    {
      title: 'Search @pixpilot utilities',
      description:
        'Find utilities by what they do (e.g. "truncate with ellipsis", "start of day", "remove null values", "uuid"). Returns compact matches ranked by relevance: name, package, import path, runtime, signature, and a one-line summary. An empty query with `package` lists that package.',
      inputSchema: {
        query: z
          .string()
          .describe('Task description or utility name. Empty lists utilities.'),
        package: z
          .string()
          .optional()
          .describe(
            'Limit to one package, e.g. "@pixpilot/date", "date", or "@pixpilot/env/node".',
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
    async ({ query, ...options }) => {
      const results = searchUtilities(registry.utilities, query, options);

      return jsonResult({
        results,
        ...(results.length === 0
          ? { hint: 'No matches. Try fewer or different words, or call list_packages.' }
          : {}),
      });
    },
  );

  server.registerTool(
    'get_utility_details',
    {
      title: 'Get @pixpilot utility details',
      description:
        'Full documentation for one utility: signatures with parameter and return types, option object properties, examples, notes, runtime, import statement, and install command.',
      inputSchema: {
        name: z.string().min(1).describe('Exact exported name, e.g. "keysToCamelCase".'),
        package: z
          .string()
          .optional()
          .describe(
            'Package or import path, only needed when the name exists in several packages.',
          ),
      },
    },
    async ({ name, package: packageFilter }) => {
      const matches = findUtilities(registry.utilities, name, packageFilter);

      if (matches.length === 0) {
        const suggestions = searchUtilities(registry.utilities, name, {
          limit: SUGGESTION_LIMIT,
          ...(packageFilter === undefined ? {} : { package: packageFilter }),
        }).map((result) => `${result.name} (${result.importPath})`);

        const scope = packageFilter === undefined ? '' : ` in ${packageFilter}`;
        const didYouMean =
          suggestions.length > 0 ? ` Did you mean: ${suggestions.join(', ')}?` : '';

        return errorResult(
          `Utility "${name}" was not found${scope}.${didYouMean} Use search_utilities to find it.`,
        );
      }

      if (matches.length > 1) {
        return errorResult(
          `"${name}" exists in several packages: ${matches
            .map((match) => match.importPath)
            .join(', ')}. Pass \`package\` to pick one.`,
        );
      }

      const [utility] = matches;

      return jsonResult({
        utility: {
          ...utility,
          import: importStatement(utility!),
          install: installCommand(utility!.package),
        },
      });
    },
  );

  return server;
}

/** Starts the MCP server over stdio (used by the bin entrypoint). */
export async function startServer(version: string): Promise<void> {
  try {
    const server = createServer({ version });
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to start ${SERVER_NAME} MCP server: ${message}`);
    process.exit(1);
  }
}
