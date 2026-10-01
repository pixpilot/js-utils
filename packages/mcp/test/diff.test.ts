import type { UtilityDoc, UtilityRegistry } from '../src/types';
import { describe, expect, it } from 'vitest';
import { diffRegistries } from '../src/generator';
import { utility } from './helpers';

function registryOf(...utilities: UtilityDoc[]): UtilityRegistry {
  return { packages: [], utilities };
}

describe('diffRegistries', () => {
  it('returns nothing for identical registries', () => {
    expect(
      diffRegistries(
        registryOf(utility({ name: 'truncate' })),
        registryOf(utility({ name: 'truncate' })),
      ),
    ).toEqual([]);
  });

  it('reports added and removed utilities', () => {
    const changes = diffRegistries(
      registryOf(utility({ name: 'old' })),
      registryOf(utility({ name: 'next' })),
    );

    expect(changes).toEqual([
      'added @acme/text › next: next(value: string): string',
      'removed @acme/text › old',
    ]);
  });

  it('reports parameter and return type changes with both signatures', () => {
    const changed = utility({
      name: 'truncate',
      signatures: [
        {
          text: 'truncate(value: string, max?: number): number',
          parameters: [],
          returns: { type: 'number' },
        },
      ],
    });

    const changes = diffRegistries(
      registryOf(utility({ name: 'truncate' })),
      registryOf(changed),
    );

    expect(changes).toEqual([
      'changed @acme/text › truncate signature:\n      was: truncate(value: string): string\n      now: truncate(value: string, max?: number): number',
    ]);
  });

  it('reports documentation-only changes by field', () => {
    const changes = diffRegistries(
      registryOf(utility({ name: 'truncate' })),
      registryOf(
        utility({ name: 'truncate', description: 'Shorten.', keywords: ['cut'] }),
      ),
    );

    expect(changes).toEqual(['changed @acme/text › truncate: description, keywords']);
  });

  it('reports package-level changes', () => {
    const pkg = {
      name: '@acme/text',
      description: 'Text.',
      category: 'Text',
      keywords: [],
      entryPoints: [],
      utilityCount: 1,
    };

    expect(
      diffRegistries(
        { packages: [pkg], utilities: [] },
        { packages: [{ ...pkg, category: 'Strings' }], utilities: [] },
      ),
    ).toEqual(['package @acme/text: category']);
    expect(
      diffRegistries({ packages: [pkg], utilities: [] }, { packages: [], utilities: [] }),
    ).toEqual(['package @acme/text: removed']);
  });
});
