import { defineMcpConfig } from '@pixpilot/mcp/generator';

/**
 * Registry generator settings (`pnpm mcp:generate`). Defaults cover the rest:
 * every public package in `packages/*`, catalogs in `catalog/<dir>.ts`, output
 * in `src/generated/registry.json`.
 */
export default defineMcpConfig({
  // The generator itself is build tooling, not a utility package.
  excludePackages: ['@pixpilot/mcp'],
});
