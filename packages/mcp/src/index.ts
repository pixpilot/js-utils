/** Runtime API: serve a generated registry as an MCP server. The generator lives in `@pixpilot/mcp/generator`. */
export {
  asRegistry,
  findUtilities,
  importStatement,
  installCommand,
  listPackages,
} from './registry';
export { DEFAULT_SEARCH_LIMIT, queryTerms, searchUtilities } from './search';
export type { SearchUtilitiesOptions, UtilitySearchResult } from './search';
export { buildInstructions, createMcpServer, startMcpServer } from './server';
export type { McpServerOptions } from './server';
export type * from './types';
export { readPackageVersion } from './version';
