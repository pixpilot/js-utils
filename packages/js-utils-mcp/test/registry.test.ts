import type { UtilityDoc, UtilityRegistry } from '../src/types';
import { describe, expect, it } from 'vitest';
import {
  buildRegistry,
  diffRegistries,
  readCommittedRegistry,
} from '../scripts/build-registry';

// Building the registry type-checks every package entry point.
const BUILD_TIMEOUT_MS = 120_000;

function utility(overrides: Partial<UtilityDoc>): UtilityDoc {
  return {
    name: 'truncate',
    kind: 'function',
    package: '@pixpilot/string',
    importPath: '@pixpilot/string',
    runtime: 'universal',
    category: 'String',
    description: 'Truncate a string.',
    signatures: [
      {
        text: 'truncate(str: string, maxLength: number): string',
        parameters: [],
        returns: { type: 'string' },
      },
    ],
    examples: ["truncate('Hello World', 5)"],
    keywords: [],
    notes: [],
    source: 'packages/string/src/manipulation.ts',
    ...overrides,
  };
}

function registryOf(...utilities: UtilityDoc[]): UtilityRegistry {
  return { packages: [], utilities };
}

describe('generated MCP registry', () => {
  it(
    'is in sync with the workspace sources (run `pnpm mcp:generate` if this fails)',
    async () => {
      const current = await buildRegistry();
      const changes = diffRegistries(readCommittedRegistry(), current);

      expect(
        changes,
        `src/generated/registry.json is stale. Run \`pnpm mcp:generate\`, review the diff, and commit it:\n  ${changes.join('\n  ')}`,
      ).toEqual([]);
    },
    BUILD_TIMEOUT_MS,
  );

  it('documents every function with a description and an example', () => {
    const undocumented = readCommittedRegistry()
      .utilities.filter(
        (item) => item.kind === 'function' && item.deprecated === undefined,
      )
      .filter((item) => item.description.length === 0 || item.examples.length === 0)
      .map((item) => `${item.importPath} › ${item.name}`);

    expect(undocumented).toEqual([]);
  });

  it('covers every public package', () => {
    const names = readCommittedRegistry().packages.map((pkg) => pkg.name);

    expect(names).toEqual(expect.arrayContaining(['@pixpilot/string', '@pixpilot/env']));
    expect(names).not.toContain('@pixpilot/js-utils-mcp');
  });
});

describe('diffRegistries', () => {
  it('returns nothing for identical registries', () => {
    expect(diffRegistries(registryOf(utility({})), registryOf(utility({})))).toEqual([]);
  });

  it('reports added and removed utilities', () => {
    const changes = diffRegistries(
      registryOf(utility({ name: 'old' })),
      registryOf(utility({ name: 'new' })),
    );

    expect(changes).toEqual([
      'added @pixpilot/string › new: truncate(str: string, maxLength: number): string',
      'removed @pixpilot/string › old',
    ]);
  });

  it('reports parameter and return type changes with both signatures', () => {
    const changed = utility({
      signatures: [
        {
          text: 'truncate(str: string, maxLength: number, ellipsis?: string): string',
          parameters: [],
          returns: { type: 'string' },
        },
      ],
    });

    const [change] = diffRegistries(registryOf(utility({})), registryOf(changed));

    expect(change).toContain('changed @pixpilot/string › truncate signature');
    expect(change).toContain('was: truncate(str: string, maxLength: number): string');
    expect(change).toContain(
      'now: truncate(str: string, maxLength: number, ellipsis?: string): string',
    );
  });

  it('reports documentation-only changes by field', () => {
    const changes = diffRegistries(
      registryOf(utility({})),
      registryOf(utility({ description: 'Shorten a string.', keywords: ['ellipsis'] })),
    );

    expect(changes).toEqual([
      'changed @pixpilot/string › truncate: description, keywords',
    ]);
  });
});
