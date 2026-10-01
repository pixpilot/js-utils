import { describe, expect, it } from 'vitest';
import { registry } from '../src/registry';
import { DEFAULT_SEARCH_LIMIT, searchUtilities } from '../src/search';

function topName(query: string, options?: Parameters<typeof searchUtilities>[2]) {
  return searchUtilities(registry.utilities, query, options)[0]?.name;
}

describe('searchUtilities', () => {
  it.each([
    ['end of month', 'endOfMonth'],
    ['camel case keys', 'keysToCamelCase'],
    ['uuid', 'isGuidString'],
    ['load .env in monorepo', 'loadRootEnvFiles'],
    ['truncate with ellipsis', 'truncate'],
    ['remove null values', 'cleanObject'],
    ['format price cents', 'formatMoney'],
    ['move item in array', 'arrayMove'],
    ['days between dates', 'diffDays'],
    ['get nested value by path', 'getObjectValueByPath'],
    ['thousands separator', 'formatWithSeparator'],
  ])('ranks the right utility first for "%s"', (query, expected) => {
    expect(topName(query)).toBe(expected);
  });

  it('tolerates a typo in the utility name', () => {
    expect(topName('trunacte')).toBe('truncate');
  });

  it('returns compact results with import path, runtime and signature', () => {
    const [result] = searchUtilities(registry.utilities, 'loadRootEnvFiles');

    expect(result).toMatchObject({
      name: 'loadRootEnvFiles',
      package: '@pixpilot/env',
      importPath: '@pixpilot/env/node',
      runtime: 'node',
      signature: expect.stringContaining('loadRootEnvFiles('),
    });
    expect(result).not.toHaveProperty('examples');
  });

  it('lists a package alphabetically for an empty query', () => {
    const results = searchUtilities(registry.utilities, '', {
      package: 'date',
      limit: 100,
    });
    const names = results.map((result) => result.name);

    expect(results.every((result) => result.package === '@pixpilot/date')).toBe(true);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(results.every((result) => result.score === 0)).toBe(true);
  });

  it('accepts package names, short names and import paths as filters', () => {
    const byImportPath = searchUtilities(registry.utilities, '', {
      package: '@pixpilot/env/node',
      limit: 100,
    });

    expect(byImportPath.length).toBeGreaterThan(0);
    expect(
      byImportPath.every((result) => result.importPath === '@pixpilot/env/node'),
    ).toBe(true);
  });

  it('excludes node-only utilities when searching for browser code', () => {
    const results = searchUtilities(registry.utilities, 'env', {
      runtime: 'browser',
      limit: 50,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.runtime === 'node')).toBe(false);
  });

  it('filters by kind and respects the limit', () => {
    expect(
      searchUtilities(registry.utilities, '', { kind: 'type', limit: 100 }).every(
        (result) => result.kind === 'type',
      ),
    ).toBe(true);
    expect(searchUtilities(registry.utilities, '')).toHaveLength(DEFAULT_SEARCH_LIMIT);
    expect(searchUtilities(registry.utilities, 'date', { limit: 2 })).toHaveLength(2);
  });

  it('returns nothing for unrelated queries', () => {
    expect(searchUtilities(registry.utilities, 'kubernetes')).toEqual([]);
  });
});
