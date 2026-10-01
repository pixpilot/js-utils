import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { importModule } from './load-module';

/** Quality gates applied to every function and constant during generation. */
export interface McpRules {
  /** Functions and constants need a JSDoc summary. Default: true. */
  requireDescription?: boolean;
  /** Non-deprecated functions need an `@example`. Default: true. */
  requireExample?: boolean;
  /** At least one example must call the function by name, catching renames. Default: true. */
  requireExampleCallsName?: boolean;
}

/**
 * Generator settings, exported as the default of an `mcp.config.ts` file placed
 * in the package that ships the MCP server. Relative paths resolve from that file.
 */
export interface McpConfig {
  /**
   * Monorepo root. Default: the nearest ancestor of the config file containing
   * `pnpm-workspace.yaml` or `.git`.
   */
  root?: string;
  /**
   * Package directories, relative to `root`. Each entry is a directory or a
   * `dir/*` pattern. Default: `['packages/*']`.
   */
  packages?: readonly string[];
  /**
   * Package names to leave out. Private packages and the package that holds
   * the config file are always left out.
   */
  excludePackages?: readonly string[];
  /**
   * Catalog file of each package. `{dir}` is the package directory name and
   * `{packageDir}` its absolute path. Default: `'catalog/{dir}.ts'`.
   */
  catalog?: string;
  /** Fail when a package has no catalog file. Default: true. */
  requireCatalog?: boolean;
  /** Generated registry file. Default: `'src/generated/registry.json'`. */
  output?: string;
  /** tsconfig used to resolve imports. Default: `tsconfig.json` next to the config, if any. */
  tsconfig?: string;
  rules?: McpRules;
}

/** {@link McpConfig} with defaults applied and every path absolute. */
export interface ResolvedMcpConfig {
  configDir: string;
  root: string;
  packages: readonly string[];
  excludePackages: ReadonlySet<string>;
  catalog: string;
  requireCatalog: boolean;
  output: string;
  tsconfig: string | undefined;
  rules: Required<McpRules>;
}

/** File names searched for, in order, by {@link loadMcpConfig}. */
export const CONFIG_FILE_NAMES = [
  'mcp.config.ts',
  'mcp.config.mts',
  'mcp.config.js',
  'mcp.config.mjs',
] as const;

const ROOT_MARKERS = ['pnpm-workspace.yaml', '.git'];

/** Identity helper that types an `mcp.config.ts` file. */
export function defineMcpConfig(config: McpConfig): McpConfig {
  return config;
}

function hasRootMarker(dir: string): boolean {
  return ROOT_MARKERS.some((marker) => existsSync(path.join(dir, marker)));
}

function findRoot(start: string): string {
  let dir = start;

  while (!hasRootMarker(dir)) {
    const parent = path.dirname(dir);

    if (parent === dir) {
      throw new Error(
        `No monorepo root (pnpm-workspace.yaml or .git) found above ${start}. Set \`root\` in the MCP config.`,
      );
    }

    dir = parent;
  }

  return dir;
}

function readPackageName(dir: string): string | undefined {
  const manifestPath = path.join(dir, 'package.json');

  if (!existsSync(manifestPath)) {
    return undefined;
  }

  return (JSON.parse(readFileSync(manifestPath, 'utf8')) as { name?: string }).name;
}

/** Applies defaults and resolves paths relative to `configDir`. */
export function resolveMcpConfig(
  config: McpConfig,
  configDir: string,
): ResolvedMcpConfig {
  const dir = path.resolve(configDir);
  const tsconfig =
    config.tsconfig === undefined
      ? path.join(dir, 'tsconfig.json')
      : path.resolve(dir, config.tsconfig);
  const selfName = readPackageName(dir);
  const catalog = config.catalog ?? 'catalog/{dir}.ts';

  return {
    configDir: dir,
    root: config.root === undefined ? findRoot(dir) : path.resolve(dir, config.root),
    packages: config.packages ?? ['packages/*'],
    excludePackages: new Set([
      ...(config.excludePackages ?? []),
      ...(selfName === undefined ? [] : [selfName]),
    ]),
    catalog: catalog.startsWith('{packageDir}') ? catalog : path.join(dir, catalog),
    requireCatalog: config.requireCatalog ?? true,
    output: path.resolve(dir, config.output ?? 'src/generated/registry.json'),
    tsconfig: existsSync(tsconfig) ? tsconfig : undefined,
    rules: {
      requireDescription: config.rules?.requireDescription ?? true,
      requireExample: config.rules?.requireExample ?? true,
      requireExampleCallsName: config.rules?.requireExampleCallsName ?? true,
    },
  };
}

/**
 * Loads and resolves the MCP config. `location` is the config file or the
 * directory that contains it (default: the current working directory).
 */
export async function loadMcpConfig(
  location: string = process.cwd(),
): Promise<ResolvedMcpConfig> {
  const resolved = path.resolve(location);
  const configPath =
    existsSync(resolved) && !path.extname(resolved)
      ? CONFIG_FILE_NAMES.map((name) => path.join(resolved, name)).find((file) =>
          existsSync(file),
        )
      : resolved;

  if (configPath === undefined || !existsSync(configPath)) {
    throw new Error(
      `No MCP config found at ${resolved}. Create one of: ${CONFIG_FILE_NAMES.join(', ')}.`,
    );
  }

  const config = await importModule<McpConfig>(configPath);

  return resolveMcpConfig(config ?? {}, path.dirname(configPath));
}
