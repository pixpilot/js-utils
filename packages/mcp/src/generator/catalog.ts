import type { UtilityRuntime } from '../types';

/**
 * Hand-written extras for one utility. Everything factual (signature, params,
 * return type, description, examples) is extracted from the source and its JSDoc,
 * so only add what the source cannot express.
 */
export interface CatalogUtility {
  /** Extra search terms, typically synonyms the name and description do not contain. */
  keywords?: readonly string[];
  /** Usage guidance not tied to a single parameter. */
  notes?: readonly string[];
  /** Examples appended after the JSDoc `@example` blocks. */
  examples?: readonly string[];
  /** Overrides the JSDoc summary. Use only for third-party re-exports whose docs we cannot edit. */
  description?: string;
}

/** Runtime and docs for one `exports` subpath of a package. */
export interface CatalogEntryPoint {
  runtime: UtilityRuntime;
  description?: string;
  /** Package-relative source file. Defaults to the `exports` value, or `src/index.ts` / `src/<name>.ts`. */
  source?: string;
}

/**
 * MCP catalog overlay for one workspace package, stored at the config's `catalog`
 * path (default `catalog/<package-dir>.ts`). With `requireCatalog` (the default),
 * generation fails for a package without one.
 */
export interface CatalogPackage {
  /** Group label shown in package listings and matched by search. Default: the package directory name. */
  category?: string;
  /** Runtime of the main (`.`) entry point. Default: `universal`. */
  runtime?: UtilityRuntime;
  /** Fallback when package.json has no `description`. */
  description?: string;
  /** Package-level search terms. */
  keywords?: readonly string[];
  /** Per-subpath overrides, keyed like package.json `exports` (`.`, `./node`). */
  entryPoints?: Readonly<Record<string, CatalogEntryPoint>>;
  /** Per-utility extras, keyed by exported name. Unknown names fail generation. */
  utilities?: Readonly<Record<string, CatalogUtility>>;
  /** Exported names deliberately hidden from the MCP server. */
  exclude?: readonly string[];
}

/** Identity helper that types a `catalog/<package-dir>.ts` file. */
export function defineCatalogPackage(config: CatalogPackage): CatalogPackage {
  return config;
}
