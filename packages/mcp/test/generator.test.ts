import type { UtilityDoc } from '../src/types';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildRegistry,
  checkRegistry,
  generateRegistry,
  loadMcpConfig,
  readRegistryFile,
  RegistryValidationError,
  resolveMcpConfig,
} from '../src/generator';
import { createTempWorkspace, fixtureWorkspaceFiles } from './helpers';

// Each build type-checks the fixture workspace.
const TIMEOUT_MS = 60_000;

let cleanup: (() => Promise<void>) | undefined;

function workspace(overrides: Record<string, string> = {}) {
  const created = createTempWorkspace({ ...fixtureWorkspaceFiles(), ...overrides });
  cleanup = created.cleanup;
  return { ...created, configDir: path.join(created.root, 'packages/mcp-server') };
}

async function problemsOf(promise: Promise<unknown>): Promise<readonly string[]> {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );

  expect(error).toBeInstanceOf(RegistryValidationError);
  return (error as RegistryValidationError).problems;
}

function find(utilities: readonly UtilityDoc[], name: string): UtilityDoc | undefined {
  return utilities.find((item) => item.name === name);
}

afterEach(async () => {
  await cleanup?.();
  cleanup = undefined;
});

describe('loadMcpConfig', () => {
  it('finds the config file and applies defaults', async () => {
    const { root, configDir } = workspace();
    const config = await loadMcpConfig(configDir);

    expect(config.root).toBe(root);
    expect(config.packages).toEqual(['packages/*']);
    expect(config.output).toBe(path.join(configDir, 'src/generated/registry.json'));
    expect(config.catalog).toBe(path.join(configDir, 'catalog/{dir}.ts'));
    expect(config.excludePackages.has('@fx/mcp-server')).toBe(true);
    expect(config.tsconfig).toBeUndefined();
    expect(config.rules).toEqual({
      requireDescription: true,
      requireExample: true,
      requireExampleCallsName: true,
    });
  });

  it('reports a missing config file', async () => {
    const { root } = workspace();

    await expect(loadMcpConfig(root)).rejects.toThrow('No MCP config found');
  });
});

describe('buildRegistry', () => {
  it(
    'documents every public package from its source and catalog',
    async () => {
      const { configDir } = workspace();
      const registry = await buildRegistry(await loadMcpConfig(configDir));

      expect(registry.packages.map((pkg) => pkg.name)).toEqual(['@fx/env', '@fx/text']);
      expect(registry.packages[0]?.entryPoints).toEqual([
        { importPath: '@fx/env', runtime: 'universal' },
        {
          importPath: '@fx/env/node',
          runtime: 'node',
          description: 'Node-only helpers.',
        },
      ]);
      expect(find(registry.utilities, 'readText')).toMatchObject({
        importPath: '@fx/env/node',
        runtime: 'node',
      });
      expect(find(registry.utilities, 'internal')).toBeUndefined();
    },
    TIMEOUT_MS,
  );

  it(
    'extracts signatures, parameters, options, examples, and catalog extras',
    async () => {
      const { configDir } = workspace();
      const registry = await buildRegistry(await loadMcpConfig(configDir));

      expect(find(registry.utilities, 'shout')).toEqual({
        name: 'shout',
        kind: 'function',
        package: '@fx/text',
        importPath: '@fx/text',
        runtime: 'universal',
        category: 'Text',
        description: 'Upper-case a string.',
        signatures: [
          {
            text: 'shout(value: string, options: ShoutOptions = {}): string',
            parameters: [
              {
                name: 'value',
                type: 'string',
                optional: false,
                description: 'Text to shout',
              },
              {
                name: 'options',
                type: 'ShoutOptions',
                optional: true,
                defaultValue: '{}',
                description: 'Shout options',
                properties: [
                  {
                    name: 'suffix',
                    type: 'string',
                    optional: true,
                    description: 'Text appended after the shout.',
                  },
                ],
              },
            ],
            returns: { type: 'string', description: 'The shouted text' },
          },
        ],
        examples: ["shout('hi'); // 'HI!'"],
        keywords: ['uppercase'],
        notes: [],
        source: 'packages/text/src/index.ts',
      });
      expect(find(registry.utilities, 'DEFAULT_SUFFIX')).toMatchObject({
        kind: 'constant',
        type: '"!"',
        value: "'!'",
      });
      expect(find(registry.utilities, 'ShoutOptions')).toMatchObject({
        kind: 'type',
        type: 'interface ShoutOptions {\n    suffix?: string;\n}',
      });
    },
    TIMEOUT_MS,
  );

  it(
    'lists every missing doc and stale catalog entry at once',
    async () => {
      const { configDir } = workspace({
        'packages/text/src/index.ts':
          'export function undocumented(): void {}\n\n/**\n * Renamed.\n *\n * @example\n * oldName();\n */\nexport function newName(): void {}\n',
        'packages/mcp-server/catalog/text.ts':
          "export default { utilities: { gone: { keywords: ['x'] } } };\n",
        'packages/mcp-server/catalog/removed.ts': 'export default {};\n',
        'packages/extra/package.json': JSON.stringify({
          name: '@fx/extra',
          description: 'x',
        }),
        'packages/extra/src/index.ts': 'export const x = 1;\n',
      });

      const problems = await problemsOf(buildRegistry(await loadMcpConfig(configDir)));

      expect(problems).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            '@fx/text › undocumented (packages/text/src/index.ts): missing description',
          ),
          expect.stringContaining(
            '@fx/text › undocumented (packages/text/src/index.ts): missing example',
          ),
          expect.stringContaining(
            '@fx/text › newName (packages/text/src/index.ts): no @example calls newName',
          ),
          expect.stringContaining('references "gone", which @fx/text no longer exports'),
          expect.stringContaining(
            'packages/mcp-server/catalog/removed.ts does not match a documented package',
          ),
          expect.stringContaining(
            '@fx/extra has no MCP catalog. Add packages/mcp-server/catalog/extra.ts',
          ),
        ]),
      );
    },
    TIMEOUT_MS,
  );

  it(
    'applies relaxed rules and catalog defaults when configured',
    async () => {
      const { configDir } = workspace({
        'packages/text/src/index.ts':
          '/** Documented. */\nexport function bare(): void {}\n',
        'packages/mcp-server/mcp.config.ts':
          'export default { requireCatalog: false, rules: { requireExample: false } };\n',
        'packages/mcp-server/catalog/text.ts': '',
      });

      const config = await loadMcpConfig(configDir);
      const registry = await buildRegistry(config);

      expect(find(registry.utilities, 'bare')).toMatchObject({
        category: 'text',
        runtime: 'universal',
        examples: [],
      });
    },
    TIMEOUT_MS,
  );

  it(
    'reads catalogs stored inside each package',
    async () => {
      const { configDir, write } = workspace();
      write(
        'packages/text/mcp.catalog.ts',
        "export default { category: 'Strings', exclude: ['internal'] };\n",
      );
      write(
        'packages/env/mcp.catalog.ts',
        "export default { entryPoints: { './node': { runtime: 'node' } } };\n",
      );

      const config = resolveMcpConfig(
        { catalog: '{packageDir}/mcp.catalog.ts' },
        configDir,
      );
      const registry = await buildRegistry(config);

      expect(find(registry.utilities, 'shout')?.category).toBe('Strings');
    },
    TIMEOUT_MS,
  );
});

describe('generateRegistry and checkRegistry', () => {
  it(
    'writes the registry, then reports source changes as drift',
    async () => {
      const { configDir, write } = workspace();
      const config = await loadMcpConfig(configDir);

      const first = await generateRegistry(config);
      expect(first.written).toBe(true);
      expect(existsSync(config.output)).toBe(true);
      expect(readRegistryFile(config.output)).toEqual(first.registry);
      expect(await checkRegistry(config)).toEqual([]);

      write(
        'packages/env/src/index.ts',
        "/**\n * Read a flag.\n *\n * @example\n * readFlag('DEBUG', true);\n */\nexport function readFlag(name: string, fallback: boolean): boolean {\n  return fallback || name.length > 0;\n}\n",
      );

      const changes = await checkRegistry(config);
      expect(changes).toEqual([
        'changed @fx/env › readFlag signature:\n      was: readFlag(name: string): boolean\n      now: readFlag(name: string, fallback: boolean): boolean',
        'changed @fx/env › readFlag: description, examples',
      ]);

      const checked = await generateRegistry(config, { check: true });
      expect(checked.written).toBe(false);
      expect(checked.changes).toEqual(changes);
    },
    TIMEOUT_MS,
  );

  it(
    'writes plain two-space JSON when the consumer has no Prettier',
    async () => {
      const { configDir } = workspace();
      const config = await loadMcpConfig(configDir);

      await generateRegistry(config);

      expect(readFileSync(config.output, 'utf8')).toContain('"keywords": [\n');
    },
    TIMEOUT_MS,
  );
});
