import type { ResolvedMcpConfig } from './config';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** The package.json fields the generator reads. */
export interface PackageJson {
  name: string;
  private?: boolean;
  description?: string;
  keywords?: string[];
  exports?: string | Record<string, unknown>;
}

/** A public workspace package the registry documents. */
export interface WorkspacePackage {
  /** Directory name, e.g. `string`. */
  dir: string;
  /** Absolute package directory. */
  root: string;
  manifest: PackageJson;
}

function readManifest(dir: string): PackageJson | undefined {
  const manifestPath = path.join(dir, 'package.json');

  if (!existsSync(manifestPath)) {
    return undefined;
  }

  return JSON.parse(readFileSync(manifestPath, 'utf8')) as PackageJson;
}

/** Expands a `dir` or `dir/*` pattern into package directories. */
function expandPattern(root: string, pattern: string): string[] {
  const normalized = pattern.replaceAll('\\', '/').replace(/\/+$/u, '');

  if (!normalized.endsWith('/*')) {
    return [path.resolve(root, normalized)];
  }

  const parent = path.resolve(root, normalized.slice(0, -'/*'.length));

  if (!existsSync(parent)) {
    return [];
  }

  return readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(parent, entry.name));
}

/**
 * Public packages matched by the config's `packages` patterns, sorted by name.
 * Private and excluded packages are left out.
 */
export function findWorkspacePackages(config: ResolvedMcpConfig): WorkspacePackage[] {
  const dirs = new Set(
    config.packages.flatMap((pattern) => expandPattern(config.root, pattern)),
  );
  const packages: WorkspacePackage[] = [];

  for (const root of dirs) {
    const manifest = readManifest(root);

    if (
      manifest !== undefined &&
      manifest.private !== true &&
      !config.excludePackages.has(manifest.name)
    ) {
      packages.push({ dir: path.basename(root), root, manifest });
    }
  }

  return packages.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
}

/** Subpaths a package exposes, e.g. `.` and `./node`, with their string targets. Wildcards are skipped. */
export function exportSubpaths(manifest: PackageJson): Map<string, string | undefined> {
  const subpaths = new Map<string, string | undefined>();
  const { exports } = manifest;

  if (exports === undefined || typeof exports === 'string') {
    subpaths.set('.', exports);
    return subpaths;
  }

  const keys = Object.keys(exports);

  if (!keys.every((key) => key.startsWith('.'))) {
    // Conditions object (`{ types, import }`) for the root export only.
    subpaths.set('.', undefined);
    return subpaths;
  }

  for (const key of keys) {
    if (!key.includes('*') && key !== './package.json') {
      const target = exports[key];
      subpaths.set(key, typeof target === 'string' ? target : undefined);
    }
  }

  return subpaths;
}

/** `./node` -> `node`. */
export function subpathName(subpath: string): string {
  return subpath.replace(/^\.\//u, '');
}

/** Source file of a subpath: its TS `exports` target, else `src/index.ts` / `src/<name>.ts`. */
export function defaultEntrySource(subpath: string, target: string | undefined): string {
  if (target !== undefined && /\.[cm]?tsx?$/u.test(target)) {
    return target;
  }

  return subpath === '.' ? 'src/index.ts' : `src/${subpathName(subpath)}.ts`;
}

/** Absolute catalog file path of a package. */
export function catalogPath(config: ResolvedMcpConfig, pkg: WorkspacePackage): string {
  return path.resolve(
    config.catalog.replaceAll('{packageDir}', pkg.root).replaceAll('{dir}', pkg.dir),
  );
}

/** Repo-relative POSIX path, used for stable `source` fields and messages. */
export function toRepoPath(root: string, filePath: string): string {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}
