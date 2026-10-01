import type { PackageDoc, UtilityDoc, UtilityRegistry } from '../src/types';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** A function entry with sensible defaults, for search and server tests. */
export function utility(overrides: Partial<UtilityDoc> & { name: string }): UtilityDoc {
  return {
    kind: 'function',
    package: '@acme/text',
    importPath: '@acme/text',
    runtime: 'universal',
    category: 'Text',
    description: `Does ${overrides.name}.`,
    signatures: [
      {
        text: `${overrides.name}(value: string): string`,
        parameters: [{ name: 'value', type: 'string', optional: false }],
        returns: { type: 'string' },
      },
    ],
    examples: [`${overrides.name}('x')`],
    keywords: [],
    notes: [],
    source: 'packages/text/src/index.ts',
    ...overrides,
  };
}

function packageDoc(overrides: Partial<PackageDoc> & { name: string }): PackageDoc {
  return {
    description: `${overrides.name} helpers.`,
    category: 'Text',
    keywords: [],
    entryPoints: [{ importPath: overrides.name, runtime: 'universal' }],
    utilityCount: 0,
    ...overrides,
  };
}

/** Small two-package registry covering functions, types, constants, and a Node-only subpath. */
export function fixtureRegistry(): UtilityRegistry {
  const { signatures: _signatures, ...defaultFiles } = utility({
    name: 'DEFAULT_FILES',
    kind: 'constant',
    package: '@acme/env',
    importPath: '@acme/env/node',
    runtime: 'node',
    category: 'Environment',
    type: 'string[]',
  });
  const utilities: UtilityDoc[] = [
    utility({
      name: 'truncate',
      description:
        'Truncate a string to a maximum length,\nadding an ellipsis when cut. Safe for empty input.',
      keywords: ['ellipsis', 'shorten'],
    }),
    utility({ name: 'toKebabCase', keywords: ['slug', 'case conversion'] }),
    utility({ name: 'toSnakeCase', keywords: ['case conversion'] }),
    utility({ name: 'legacyTrim', deprecated: 'Use trim.', keywords: ['trim'] }),
    utility({ name: 'trim', keywords: ['trim'] }),
    utility({
      name: 'TruncateOptions',
      kind: 'type',
      type: 'interface TruncateOptions { ellipsis?: string }',
    }),
    utility({
      name: 'readEnv',
      package: '@acme/env',
      importPath: '@acme/env',
      category: 'Environment',
      description: 'Read an environment variable.',
      keywords: ['process.env'],
    }),
    utility({
      name: 'loadEnvFiles',
      package: '@acme/env',
      importPath: '@acme/env/node',
      runtime: 'node',
      category: 'Environment',
      description: 'Load .env files into process.env.',
      keywords: ['dotenv'],
    }),
    defaultFiles,
  ];

  return {
    packages: [
      packageDoc({
        name: '@acme/env',
        category: 'Environment',
        entryPoints: [
          { importPath: '@acme/env', runtime: 'universal' },
          { importPath: '@acme/env/node', runtime: 'node' },
        ],
        utilityCount: 3,
      }),
      packageDoc({ name: '@acme/text', utilityCount: 6 }),
    ],
    utilities,
  };
}

/**
 * Writes files into a fresh temp directory; returns its path and a cleanup function.
 * `parentDir` defaults to the OS temp directory, where no Prettier is installed.
 */
export function createTempWorkspace(
  files: Record<string, string>,
  parentDir: string = os.tmpdir(),
): {
  root: string;
  write: (file: string, content: string) => void;
  cleanup: () => void;
} {
  mkdirSync(parentDir, { recursive: true });
  const root = mkdtempSync(path.join(parentDir, 'pixpilot-mcp-'));
  const write = (file: string, content: string): void => {
    const target = path.join(root, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };

  for (const [file, content] of Object.entries(files)) {
    write(file, content);
  }

  return { root, write, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const TEXT_SOURCE = `export interface ShoutOptions {
  /** Text appended after the shout. */
  suffix?: string;
}

/**
 * Upper-case a string.
 *
 * @param value - Text to shout
 * @param options - Shout options
 * @returns The shouted text
 *
 * @example
 * \`\`\`ts
 * shout('hi'); // 'HI!'
 * \`\`\`
 */
export function shout(value: string, options: ShoutOptions = {}): string {
  return value.toUpperCase() + (options.suffix ?? '!');
}

/** Suffix used when none is given. */
export const DEFAULT_SUFFIX = '!';

export const internal = 1;
`;

const ENV_SOURCE = `/**
 * Read a boolean flag.
 *
 * @example
 * readFlag('DEBUG'); // false
 */
export function readFlag(name: string): boolean {
  return name.length === 0;
}
`;

const ENV_NODE_SOURCE = `/**
 * Read a file as text.
 *
 * @example
 * readText('a.txt');
 */
export function readText(file: string): string {
  return file;
}
`;

/**
 * A pnpm-style monorepo with two documented packages, a private package, and
 * the MCP server package (`packages/mcp-server`) holding the config and catalogs.
 */
export function fixtureWorkspaceFiles(): Record<string, string> {
  return {
    'pnpm-workspace.yaml': "packages:\n  - 'packages/*'\n",
    'packages/text/package.json': JSON.stringify({
      name: '@fx/text',
      description: 'Text helpers.',
      exports: './src/index.ts',
    }),
    'packages/text/src/index.ts': TEXT_SOURCE,
    'packages/env/package.json': JSON.stringify({
      name: '@fx/env',
      description: 'Env helpers.',
      exports: { '.': './src/index.ts', './node': './src/node.ts' },
    }),
    'packages/env/src/index.ts': ENV_SOURCE,
    'packages/env/src/node.ts': ENV_NODE_SOURCE,
    'packages/secret/package.json': JSON.stringify({ name: '@fx/secret', private: true }),
    'packages/mcp-server/package.json': JSON.stringify({ name: '@fx/mcp-server' }),
    'packages/mcp-server/mcp.config.ts': 'export default {};\n',
    'packages/mcp-server/catalog/text.ts': `export default {
  category: 'Text',
  runtime: 'universal',
  exclude: ['internal'],
  utilities: { shout: { keywords: ['uppercase'] } },
};
`,
    'packages/mcp-server/catalog/env.ts': `export default {
  category: 'Environment',
  runtime: 'universal',
  entryPoints: { './node': { runtime: 'node', description: 'Node-only helpers.' } },
};
`,
  };
}
