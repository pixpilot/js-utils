import type { UtilityRegistry } from '../types';
import type { ResolvedMcpConfig } from './config';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRegistry } from './build-registry';
import { diffRegistries } from './diff';

const JSON_INDENT = 2;

/** Result of {@link generateRegistry}. */
export interface GenerateResult {
  registry: UtilityRegistry;
  /** Differences from the registry file that existed before. */
  changes: string[];
  /** False in check mode, where nothing is written. */
  written: boolean;
}

interface PrettierApi {
  resolveConfig: (filePath: string) => Promise<Record<string, unknown> | null>;
  format: (source: string, options: Record<string, unknown>) => Promise<string>;
}

/** Reads a registry file, or returns an empty registry when it does not exist yet. */
export function readRegistryFile(filePath: string): UtilityRegistry {
  if (!existsSync(filePath)) {
    return { packages: [], utilities: [] };
  }

  return JSON.parse(readFileSync(filePath, 'utf8')) as UtilityRegistry;
}

/** Loads the consumer's own Prettier, if installed, so the output matches their format check. */
async function loadPrettier(fromDir: string): Promise<PrettierApi | undefined> {
  try {
    const entry = createRequire(path.join(fromDir, 'package.json')).resolve('prettier');
    const module = (await import(pathToFileURL(entry).href)) as PrettierApi & {
      default?: PrettierApi;
    };
    // `require.resolve` finds Prettier's CJS entry, whose API sits on `default`.
    return module.default ?? module;
  } catch {
    return undefined;
  }
}

async function formatRegistry(
  registry: UtilityRegistry,
  config: ResolvedMcpConfig,
): Promise<string> {
  const prettier = await loadPrettier(config.configDir);

  if (!prettier) {
    return `${JSON.stringify(registry, null, JSON_INDENT)}\n`;
  }

  const options = await prettier.resolveConfig(config.output);
  return prettier.format(JSON.stringify(registry), {
    ...options,
    filepath: config.output,
  });
}

/**
 * Lists how the committed registry differs from the current sources.
 * Empty when it is up to date. Use it in a test to catch drift in CI.
 */
export async function checkRegistry(config: ResolvedMcpConfig): Promise<string[]> {
  const registry = await buildRegistry(config);
  return diffRegistries(readRegistryFile(config.output), registry);
}

/**
 * Builds the registry and writes it to `config.output`. With `check: true`,
 * only compares and writes nothing.
 */
export async function generateRegistry(
  config: ResolvedMcpConfig,
  options: { check?: boolean } = {},
): Promise<GenerateResult> {
  const registry = await buildRegistry(config);
  const changes = diffRegistries(readRegistryFile(config.output), registry);

  if (options.check === true) {
    return { registry, changes, written: false };
  }

  await mkdir(path.dirname(config.output), { recursive: true });
  await writeFile(config.output, await formatRegistry(registry, config));

  return { registry, changes, written: true };
}

/** Assertion message for a drift test, listing each change and how to fix it. */
export function formatDriftMessage(
  config: ResolvedMcpConfig,
  changes: readonly string[],
): string {
  const file = path.relative(config.configDir, config.output).replaceAll(path.sep, '/');

  return `${file} is out of date (${changes.length} change(s)). Run \`pixpilot-mcp generate\`, review the diff, and commit it:\n  ${changes.join('\n  ')}`;
}
