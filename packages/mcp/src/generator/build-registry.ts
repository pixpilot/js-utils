import type {
  EntryPointDoc,
  PackageDoc,
  UtilityDoc,
  UtilityRegistry,
  UtilityRuntime,
} from '../types';
import type { CatalogPackage } from './catalog';
import type { ResolvedMcpConfig } from './config';
import type { ExtractedSymbol } from './extract-api';
import type { WorkspacePackage } from './workspace';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ApiExtractor } from './extract-api';
import { importModule } from './load-module';
import {
  catalogPath,
  defaultEntrySource,
  exportSubpaths,
  findWorkspacePackages,
  subpathName,
  toRepoPath,
} from './workspace';

interface ResolvedEntryPoint extends EntryPointDoc {
  file: string;
}

interface PackageContext {
  pkg: WorkspacePackage;
  catalog: CatalogPackage;
  /** Repo-relative catalog path, for messages. */
  catalogFile: string;
}

const DEFAULT_RUNTIME: UtilityRuntime = 'universal';

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

async function loadCatalogs(
  config: ResolvedMcpConfig,
  packages: readonly WorkspacePackage[],
  problems: string[],
): Promise<PackageContext[]> {
  const loaded = await Promise.all(
    packages.map(async (pkg) => {
      const file = catalogPath(config, pkg);
      const catalogFile = toRepoPath(config.root, file);
      const catalog = existsSync(file)
        ? await importModule<CatalogPackage>(file)
        : undefined;

      if (catalog === undefined && config.requireCatalog) {
        problems.push(
          `${pkg.manifest.name} has no MCP catalog. Add ${catalogFile} ` +
            '(`export default defineCatalogPackage({ category, runtime })`).',
        );
        return undefined;
      }

      return { pkg, catalog: catalog ?? {}, catalogFile };
    }),
  );

  return loaded.filter((context): context is PackageContext => context !== undefined);
}

/** Reports catalog files left behind after a package was removed or renamed. */
function findOrphanCatalogs(
  config: ResolvedMcpConfig,
  packages: readonly WorkspacePackage[],
  problems: string[],
): void {
  const catalogDir = path.dirname(config.catalog);
  const fileName = path.basename(config.catalog);

  // Only a shared catalog directory (`catalog/{dir}.ts`) can hold orphans.
  if (
    catalogDir.includes('{') ||
    !fileName.includes('{dir}') ||
    !existsSync(catalogDir)
  ) {
    return;
  }

  const [prefix = '', suffix = ''] = fileName.split('{dir}');
  const knownDirs = new Set(packages.map((pkg) => pkg.dir));

  for (const file of readdirSync(catalogDir)) {
    if (file.startsWith(prefix) && file.endsWith(suffix)) {
      const dir = file.slice(prefix.length, file.length - suffix.length);

      if (!knownDirs.has(dir)) {
        problems.push(
          `${toRepoPath(config.root, path.join(catalogDir, file))} does not match a documented package.`,
        );
      }
    }
  }
}

function resolveEntryPoints(
  config: ResolvedMcpConfig,
  { pkg, catalog, catalogFile }: PackageContext,
  problems: string[],
): ResolvedEntryPoint[] {
  const subpaths = exportSubpaths(pkg.manifest);

  for (const key of Object.keys(catalog.entryPoints ?? {})) {
    if (!subpaths.has(key)) {
      problems.push(
        `${catalogFile}: entryPoints["${key}"] is not an export of ${pkg.manifest.name}.`,
      );
    }
  }

  return [...subpaths].map(([subpath, target]) => {
    const override = catalog.entryPoints?.[subpath];
    const runtime =
      override?.runtime ??
      (subpath === '.' ? (catalog.runtime ?? DEFAULT_RUNTIME) : DEFAULT_RUNTIME);
    const file = path.join(
      pkg.root,
      override?.source ?? defaultEntrySource(subpath, target),
    );

    if (!existsSync(file)) {
      problems.push(
        `${pkg.manifest.name}: entry source ${toRepoPath(config.root, file)} does not exist. ` +
          `Set entryPoints["${subpath}"].source in ${catalogFile}.`,
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
  config: ResolvedMcpConfig,
  symbol: ExtractedSymbol,
  { pkg, catalog }: PackageContext,
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
    category: catalog.category ?? pkg.dir,
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
    source: toRepoPath(config.root, symbol.sourceFile),
  };
}

function escapeRegExp(text: string): string {
  return text.replace(/[$()*+.?[\\\]^{|}]/gu, '\\$&');
}

/** Quality gate: every function and constant must be usable from its MCP entry alone. */
function validateUtility(
  config: ResolvedMcpConfig,
  utility: UtilityDoc,
  problems: string[],
): void {
  if (utility.kind === 'type') {
    return;
  }

  const { rules } = config;
  const where = `${utility.importPath} › ${utility.name} (${utility.source})`;

  if (rules.requireDescription && utility.description.length === 0) {
    problems.push(
      `${where}: missing description. Add a JSDoc summary to the declaration.`,
    );
  }

  if (utility.kind !== 'function' || utility.deprecated !== undefined) {
    return;
  }

  if (utility.examples.length === 0) {
    if (rules.requireExample) {
      problems.push(
        `${where}: missing example. Add a JSDoc @example to the declaration.`,
      );
    }
  } else if (
    rules.requireExampleCallsName &&
    !utility.examples.some((example) =>
      new RegExp(`\\b${escapeRegExp(utility.name)}\\b`, 'u').test(example),
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
 * Builds the MCP registry from the workspace sources and the catalog overlays.
 * Throws {@link RegistryValidationError} listing every missing or stale entry.
 */
export async function buildRegistry(config: ResolvedMcpConfig): Promise<UtilityRegistry> {
  const problems: string[] = [];
  const packages = findWorkspacePackages(config);
  const contexts = await loadCatalogs(config, packages, problems);

  findOrphanCatalogs(config, packages, problems);

  const resolved = contexts.map((context) => ({
    context,
    entryPoints: resolveEntryPoints(config, context, problems),
  }));

  const extractor = new ApiExtractor(
    resolved.flatMap(({ entryPoints }) =>
      entryPoints.map(({ file }) => file).filter((file) => existsSync(file)),
    ),
    config.tsconfig,
  );

  const packageDocs: PackageDoc[] = [];
  const utilities: UtilityDoc[] = [];

  for (const { context, entryPoints } of resolved) {
    const { pkg, catalog, catalogFile } = context;
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
          const utility = toUtilityDoc(config, symbol, context, entryPoint);
          validateUtility(config, utility, problems);
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
        `${catalogFile} references "${name}", which ${pkg.manifest.name} no longer exports.`,
      );
    }

    const description = pkg.manifest.description ?? catalog.description ?? '';
    if (description.length === 0) {
      problems.push(
        `${pkg.manifest.name} has no description. Add one to its package.json or ${catalogFile}.`,
      );
    }

    packageDocs.push({
      name: pkg.manifest.name,
      description,
      category: catalog.category ?? pkg.dir,
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
