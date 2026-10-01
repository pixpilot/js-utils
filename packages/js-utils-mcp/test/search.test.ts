import { searchUtilities } from '@pixpilot/mcp';
import { describe, expect, it } from 'vitest';
import { registry } from '../src/registry';

// Guards the catalog keywords: realistic queries must find the intended utility.
describe('search over the @pixpilot registry', () => {
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
    ['trunacte', 'truncate'],
  ])('ranks the right utility first for "%s"', (query, expected) => {
    expect(searchUtilities(registry.utilities, query)[0]?.name).toBe(expected);
  });

  it('keeps Node-only env helpers out of browser searches', () => {
    const results = searchUtilities(registry.utilities, 'env', {
      runtime: 'browser',
      limit: 50,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.importPath === '@pixpilot/env/node')).toBe(
      false,
    );
  });
});
