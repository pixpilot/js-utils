import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH_LIMIT, searchUtilities } from '../src/search';
import { fixtureRegistry, utility } from './helpers';

const { utilities } = fixtureRegistry();

function names(query: string, options?: Parameters<typeof searchUtilities>[2]): string[] {
  return searchUtilities(utilities, query, options).map((result) => result.name);
}

describe('searchUtilities', () => {
  it('ranks an exact name match first', () => {
    expect(names('truncate')[0]).toBe('truncate');
  });

  it('matches natural-language queries against keywords and descriptions', () => {
    expect(names('add an ellipsis')[0]).toBe('truncate');
    expect(names('slug')[0]).toBe('toKebabCase');
    expect(names('load dotenv files')[0]).toBe('loadEnvFiles');
  });

  it('matches plural query words against singular text', () => {
    expect(names('slugs')[0]).toBe('toKebabCase');
  });

  it('tolerates a typo in the name', () => {
    expect(names('trunacte')).toEqual(['truncate']);
  });

  it('ranks types below the functions that use them', () => {
    const results = names('truncate');

    expect(results.indexOf('truncate')).toBeLessThan(results.indexOf('TruncateOptions'));
  });

  it('ranks deprecated utilities below their replacement', () => {
    expect(names('trim')).toEqual(['trim', 'legacyTrim']);
  });

  it('returns compact results with a one-sentence summary', () => {
    const [result] = searchUtilities(utilities, 'truncate');

    expect(result).toMatchObject({
      name: 'truncate',
      importPath: '@acme/text',
      runtime: 'universal',
      signature: 'truncate(value: string): string',
      summary: 'Truncate a string to a maximum length, adding an ellipsis when cut.',
    });
    expect(result).not.toHaveProperty('examples');
  });

  it('shows the type of a constant as its signature', () => {
    const [result] = searchUtilities(utilities, 'DEFAULT_FILES');

    expect(result?.signature).toBe('DEFAULT_FILES: string[]');
  });

  it('lists utilities alphabetically for an empty query', () => {
    const results = searchUtilities(utilities, '', { package: 'text', limit: 50 });
    const listed = results.map((result) => result.name);

    expect(results.every((result) => result.score === 0)).toBe(true);
    expect(listed).toEqual([...listed].sort((a, b) => a.localeCompare(b)));
    expect(results.every((result) => result.package === '@acme/text')).toBe(true);
  });

  it('accepts a package name, short name, or import path as the package filter', () => {
    expect(names('', { package: '@acme/env', limit: 50 })).toHaveLength(3);
    expect(names('', { package: 'env', limit: 50 })).toHaveLength(3);
    expect(names('', { package: '@acme/env/node', limit: 50 })).toEqual([
      'DEFAULT_FILES',
      'loadEnvFiles',
    ]);
  });

  it('leaves out node-only utilities for browser code', () => {
    expect(names('env', { runtime: 'browser' })).toEqual(['readEnv']);
  });

  it('filters by kind and respects the limit', () => {
    expect(names('', { kind: 'type', limit: 50 })).toEqual(['TruncateOptions']);
    expect(names('', { limit: 2 })).toHaveLength(2);
  });

  it('caps results at the default limit', () => {
    const many = Array.from({ length: DEFAULT_SEARCH_LIMIT + 5 }, (_, index) =>
      utility({ name: `helper${index}` }),
    );

    expect(searchUtilities(many, 'helper')).toHaveLength(DEFAULT_SEARCH_LIMIT);
  });

  it('returns nothing for unrelated queries', () => {
    expect(names('kubernetes')).toEqual([]);
  });
});
