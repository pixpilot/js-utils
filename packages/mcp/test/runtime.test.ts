import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { asRegistry, importStatement, readPackageVersion } from '../src';
import { fixtureRegistry, utility } from './helpers';

describe('asRegistry', () => {
  it('accepts a registry-shaped value', () => {
    const registry = fixtureRegistry();

    expect(asRegistry(registry)).toBe(registry);
  });

  it.each([null, {}, { packages: [] }, { utilities: [] }, 'registry'])(
    'rejects %j',
    (value) => {
      expect(() => asRegistry(value)).toThrow('Invalid MCP registry');
    },
  );
});

describe('importStatement', () => {
  it('imports values by name and types with `import type`', () => {
    expect(importStatement(utility({ name: 'trim' }))).toBe(
      "import { trim } from '@acme/text';",
    );
    expect(importStatement(utility({ name: 'Options', kind: 'type' }))).toBe(
      "import type { Options } from '@acme/text';",
    );
  });
});

describe('readPackageVersion', () => {
  it('reads the nearest package.json above the module', () => {
    const { version } = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { version: string };

    expect(readPackageVersion(import.meta.url)).toBe(version);
  });
});
