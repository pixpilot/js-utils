import type {
  EntryPointDoc,
  PackageDoc,
  UtilityDoc,
  UtilityRegistry,
  UtilityRuntime,
} from '../src/types';
import type { CatalogPackage } from './catalog';
import type { ExtractedSymbol } from './extract-api';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ApiExtractor, toRepoPath } from './extract-api';

/** Root of the js-utils-mcp package. */
export const MCP_PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

/** Root of the monorepo. */
export const REPO_ROOT = path.resolve(MCP_PACKAGE_ROOT, '../..');

/** Committed registry the server ships. */
export const REGISTRY_PATH = path.join(MCP_PACKAGE_ROOT, 'src/generated/registry.json');

const CATALOG_DIR = path.join(MCP_PACKAGE_ROOT, 'catalog');

interface PackageJson {
  name: string;
  private?: boolean;
  description?: string;
  keywords?: string[];
  exports?: string | Record<string, unknown>;
}

interface WorkspacePackage {
  dir: string;
  root: string;
  manifest: PackageJson;
}

interface ResolvedEntryPoint extends EntryPointDoc {
  file: string;
}

/** Thrown when the catalog or the sources are incomplete; lists every problem at once. */
export class RegistryValidationError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(
      `MCP registry generation failed with ${problems.length} problem(s):\n${problems
        .map((problem) => `  - ${problem}`)
        .join('\n')}`,
    );
    this.name = 'RegistryValidationError';
  }
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

/** Public workspace packages under `packages/`, excluding this MCP package. */
function findWorkspacePackages(repoRoot: string): WorkspacePackage[] {
  const packagesDir = path.join(repoRoot, 'packages');
  const selfName = readJson<PackageJson>(
    path.join(MCP_PACKAGE_ROOT, 'package.json'),
  ).name;

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ dir: entry.name, root: path.join(packagesDir, entry.name) }))
    .filter(({ root }) => existsSync(path.join(root, 'package.json')))
    .map((pkg) => ({
      ...pkg,
      manifest: readJson<PackageJson>(path.join(pkg.root, 'package.json')),
    }))
    .filter(({ manifest }) => manifest.private !== true && manifest.name !== selfName)
    .sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
}

async function loadCatalog(dir: string): Promise<CatalogPackage | undefined> {
  const filePath = path.join(CATALOG_DIR, `${dir}.ts`);

  if (!existsSync(filePath)) {
    return undefined;
  }

  const module = (await import(pathToFileURL(filePath).href)) as {
    default?: CatalogPackage;
  };

  return module.default;
}

/** Subpaths a package exposes, e.g. `.` and `./node`. Wildcards are skipped. */
function exportSubpaths(manifest: PackageJson): Map<string, string | undefined> {
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
function subpathName(subpath: string): string {
  return subpath.replace(/^\.\//u, '');
}

function defaultSource(subpath: string, target: string | undefined): string {
  if (target !== undefined && /\.tsx?$/u.test(target)) {
    return target;
  }

  return subpath === '.' ? 'src/index.ts' : `src/${subpathName(subpath)}.ts`;
}

function resolveEntryPoints(
  pkg: WorkspacePackage,
  catalog: CatalogPackage,
  problems: string[],
): ResolvedEntryPoint[] {
  const subpaths = exportSubpaths(pkg.manifest);

  for (const key of Object.keys(catalog.entryPoints ?? {})) {
    if (!subpaths.has(key)) {
      problems.push(
        `catalog/${pkg.dir}.ts: entryPoints["${key}"] is not an export of ${pkg.manifest.name}.`,
      );
    }
  }

  return [...subpaths].map(([subpath, target]) => {
    const override = catalog.entryPoints?.[subpath];
    const runtime: UtilityRuntime =
      override?.runtime ?? (subpath === '.' ? catalog.runtime : 'universal');
    const file = path.join(pkg.root, override?.source ?? defaultSource(subpath, target));

    if (!existsSync(file)) {
      problems.push(
        `${pkg.manifest.name}: entry source ${toRepoPath(REPO_ROOT, file)} does not exist. ` +
          `Set entryPoints["${subpath}"].source in catalog/${pkg.dir}.ts.`,
      );
    }

    return {
      importPath:
        subpath === '.'
          ? pkg.manifest.name
          : `${pkg.manifest.name}/${subpathName(subpath)}`,
      runtime,
      ...(override?.description === undefined
        ? {}
        : { description: override.description }),
      file,
    };
  });
}

function toUtilityDoc(
  symbol: ExtractedSymbol,
  pkg: WorkspacePackage,
  catalog: CatalogPackage,
  entryPoint: ResolvedEntryPoint,
): UtilityDoc {
  const extra = catalog.utilities?.[symbol.name];
  const description =
    extra?.description ??
    (symbol.description.length > 0 || symbol.kind !== 'type'
      ? symbol.description
      : `TypeScript type exported by ${entryPoint.importPath}.`);

  return {
    name: symbol.name,
    kind: symbol.kind,
    package: pkg.manifest.name,
    importPath: entryPoint.importPath,
    runtime: entryPoint.runtime,
    category: catalog.category,
    description,
    ...(symbol.signatures ? { signatures: symbol.signatures } : {}),
    ...(symbol.type === undefined ? {} : { type: symbol.type }),
    ...(symbol.value === undefined ? {} : { value: symbol.value }),
    ...(symbol.properties ? { properties: symbol.properties } : {}),
    examples: [...symbol.examples, ...(extra?.examples ?? [])],
    keywords: [...(extra?.keywords ?? [])],
    notes: [...(extra?.notes ?? [])],
    ...(symbol.deprecated === undefined ? {} : { deprecated: symbol.deprecated }),
    ...(symbol.reexport ? { reexport: symbol.reexport } : {}),
    source: toRepoPath(REPO_ROOT, symbol.sourceFile),
  };
}

/** Quality gate: every function and constant must be usable from its MCP entry alone. */
function validateUtility(utility: UtilityDoc, problems: string[]): void {
  if (utility.kind === 'type') {
    return;
  }

  const where = `${utility.importPath} › ${utility.name} (${utility.source})`;

  if (utility.description.length === 0) {
    problems.push(
      `${where}: missing description. Add a JSDoc summary to the declaration.`,
    );
  }

  if (utility.kind !== 'function' || utility.deprecated !== undefined) {
    return;
  }

  if (utility.examples.length === 0) {
    problems.push(`${where}: missing example. Add a JSDoc @example to the declaration.`);
  } else if (
    !utility.examples.some((example) =>
      new RegExp(`\\b${utility.name}\\b`, 'u').test(example),
    )
  ) {
    // Usually a rename the examples did not follow.
    problems.push(
      `${where}: no @example calls ${utility.name}. Update the stale examples.`,
    );
  }
}

function sortUtilities(a: UtilityDoc, b: UtilityDoc): number {
  return (
    a.package.localeCompare(b.package) ||
    a.importPath.localeCompare(b.importPath) ||
    a.name.localeCompare(b.name)
  );
}

/**
 * Builds the MCP registry from the workspace sources and the `catalog/` overlays.
 * Throws {@link RegistryValidationError} listing every missing or stale entry.
 */
export async function buildRegistry(
  repoRoot: string = REPO_ROOT,
): Promise<UtilityRegistry> {
  const problems: string[] = [];
  const packages = findWorkspacePackages(repoRoot);
  const catalogs = new Map<string, CatalogPackage>();
  const loaded = await Promise.all(packages.map(async (pkg) => loadCatalog(pkg.dir)));

  for (const [index, pkg] of packages.entries()) {
    const catalog = loaded[index];

    if (catalog) {
      catalogs.set(pkg.dir, catalog);
    } else {
      problems.push(
        `${pkg.manifest.name} has no MCP catalog. Add packages/js-utils-mcp/catalog/${pkg.dir}.ts ` +
          '(see an existing file for the shape).',
      );
    }
  }

  const knownDirs = new Set(packages.map((pkg) => pkg.dir));
  for (const file of readdirSync(CATALOG_DIR)) {
    const dir = file.replace(/\.ts$/u, '');
    if (!knownDirs.has(dir)) {
      problems.push(`catalog/${file} does not match a public package under packages/.`);
    }
  }

  const resolved = packages
    .filter((pkg) => catalogs.has(pkg.dir))
    .map((pkg) => {
      const catalog = catalogs.get(pkg.dir) as CatalogPackage;
      return { pkg, catalog, entryPoints: resolveEntryPoints(pkg, catalog, problems) };
    });

  const extractor = new ApiExtractor(
    resolved.flatMap(({ entryPoints }) =>
      entryPoints.map(({ file }) => file).filter((file) => existsSync(file)),
    ),
    path.join(MCP_PACKAGE_ROOT, 'tsconfig.json'),
  );

  const packageDocs: PackageDoc[] = [];
  const utilities: UtilityDoc[] = [];

  for (const { pkg, catalog, entryPoints } of resolved) {
    const excluded = new Set(catalog.exclude ?? []);
    const exportedNames = new Set<string>();
    let utilityCount = 0;

    for (const entryPoint of entryPoints) {
      if (!existsSync(entryPoint.file)) {
        continue;
      }

      for (const symbol of extractor.extractEntry(entryPoint.file)) {
        exportedNames.add(symbol.name);

        if (!excluded.has(symbol.name)) {
          const utility = toUtilityDoc(symbol, pkg, catalog, entryPoint);
          validateUtility(utility, problems);
          utilities.push(utility);
          utilityCount += 1;
        }
      }
    }

    const staleNames = [
      ...Object.keys(catalog.utilities ?? {}),
      ...(catalog.exclude ?? []),
    ].filter((name) => !exportedNames.has(name));

    for (const name of staleNames) {
      problems.push(
        `catalog/${pkg.dir}.ts references "${name}", which ${pkg.manifest.name} no longer exports.`,
      );
    }

    const description = pkg.manifest.description ?? catalog.description ?? '';
    if (description.length === 0) {
      problems.push(
        `${pkg.manifest.name} has no description. Add one to its package.json or catalog/${pkg.dir}.ts.`,
      );
    }

    packageDocs.push({
      name: pkg.manifest.name,
      description,
      category: catalog.category,
      keywords: [...(catalog.keywords ?? []), ...(pkg.manifest.keywords ?? [])],
      entryPoints: entryPoints.map(({ file: _file, ...entryPoint }) => entryPoint),
      utilityCount,
    });
  }

  if (problems.length > 0) {
    throw new RegistryValidationError(problems);
  }

  return { packages: packageDocs, utilities: utilities.sort(sortUtilities) };
}

function utilityKey(utility: UtilityDoc): string {
  return `${utility.importPath} › ${utility.name}`;
}

function changedFields<T extends object>(before: T, after: T): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  return [...keys].filter(
    (key) =>
      JSON.stringify(before[key as keyof T]) !== JSON.stringify(after[key as keyof T]),
  );
}

function signatureLines(utility: UtilityDoc): string {
  return (utility.signatures ?? []).map((signature) => signature.text).join(' | ');
}

/**
 * Human-readable differences between the committed registry and a fresh build.
 * Empty when the committed registry is up to date.
 */
export function diffRegistries(
  committed: UtilityRegistry,
  current: UtilityRegistry,
): string[] {
  const changes: string[] = [];
  const before = new Map(committed.utilities.map((item) => [utilityKey(item), item]));
  const after = new Map(current.utilities.map((item) => [utilityKey(item), item]));

  for (const [key, utility] of after) {
    const previous = before.get(key);

    if (!previous) {
      changes.push(`added ${key}: ${signatureLines(utility) || utility.kind}`);
      continue;
    }

    const fields = changedFields(previous, utility);
    if (fields.includes('signatures')) {
      changes.push(
        `changed ${key} signature:\n      was: ${signatureLines(previous)}\n      now: ${signatureLines(utility)}`,
      );
    }

    const otherFields = fields.filter((field) => field !== 'signatures');
    if (otherFields.length > 0) {
      changes.push(`changed ${key}: ${otherFields.join(', ')}`);
    }
  }

  for (const key of before.keys()) {
    if (!after.has(key)) {
      changes.push(`removed ${key}`);
    }
  }

  const packagesBefore = new Map(committed.packages.map((item) => [item.name, item]));
  for (const pkg of current.packages) {
    const previous = packagesBefore.get(pkg.name);
    const fields = previous ? changedFields(previous, pkg) : ['(new package)'];

    if (fields.length > 0) {
      changes.push(`package ${pkg.name}: ${fields.join(', ')}`);
    }
    packagesBefore.delete(pkg.name);
  }

  for (const name of packagesBefore.keys()) {
    changes.push(`package ${name}: removed`);
  }

  return changes;
}

/** Reads the committed registry, or an empty one when it does not exist yet. */
export function readCommittedRegistry(): UtilityRegistry {
  if (!existsSync(REGISTRY_PATH)) {
    return { packages: [], utilities: [] };
  }

  return readJson<UtilityRegistry>(REGISTRY_PATH);
}
