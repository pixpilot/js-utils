/** Build-time API: generate and check a package monorepo's MCP registry. Requires `typescript`. */
export { buildRegistry, RegistryValidationError } from './build-registry';
export { defineCatalogPackage } from './catalog';
export type { CatalogEntryPoint, CatalogPackage, CatalogUtility } from './catalog';
export {
  CONFIG_FILE_NAMES,
  defineMcpConfig,
  loadMcpConfig,
  resolveMcpConfig,
} from './config';
export type { McpConfig, McpRules, ResolvedMcpConfig } from './config';
export { diffRegistries } from './diff';
export { ApiExtractor } from './extract-api';
export type { ExtractedSymbol } from './extract-api';
export {
  checkRegistry,
  formatDriftMessage,
  generateRegistry,
  readRegistryFile,
} from './generate';
export type { GenerateResult } from './generate';
export { findWorkspacePackages } from './workspace';
export type { PackageJson, WorkspacePackage } from './workspace';
