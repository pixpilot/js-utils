import { fileURLToPath } from 'node:url';
import {
  checkRegistry,
  formatDriftMessage,
  loadMcpConfig,
} from '@pixpilot/mcp/generator';
import { describe, expect, it } from 'vitest';
import { registry } from '../src/registry';

// Building the registry type-checks every package entry point.
const BUILD_TIMEOUT_MS = 120_000;
const PACKAGE_DIR = fileURLToPath(new URL('..', import.meta.url));

describe('generated MCP registry', () => {
  it(
    'is in sync with the workspace sources (run `pnpm mcp:generate` if this fails)',
    async () => {
      const config = await loadMcpConfig(PACKAGE_DIR);
      const changes = await checkRegistry(config);

      expect(changes, formatDriftMessage(config, changes)).toEqual([]);
    },
    BUILD_TIMEOUT_MS,
  );

  it('covers every utility package but not the MCP tooling', () => {
    const names = registry.packages.map((pkg) => pkg.name);

    expect(names).toEqual(expect.arrayContaining(['@pixpilot/string', '@pixpilot/env']));
    expect(names).not.toContain('pixpilot-js-utils-mcp');
    expect(names).not.toContain('@pixpilot/mcp');
  });
});
