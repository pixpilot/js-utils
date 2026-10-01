import type { PackageDoc, UtilityDoc, UtilityRegistry } from './types';
import { matchesPackage } from './search';

/**
 * Types an imported `registry.json` after a light shape check.
 *
 * @example
 * ```typescript
 * import registryJson from './generated/registry.json';
 *
 * const registry = asRegistry(registryJson);
 * ```
 */
export function asRegistry(json: unknown): UtilityRegistry {
  const candidate = json as Partial<UtilityRegistry> | null;

  if (
    typeof candidate !== 'object' ||
    candidate === null ||
    !Array.isArray(candidate.packages) ||
    !Array.isArray(candidate.utilities)
  ) {
    throw new TypeError(
      'Invalid MCP registry: expected { packages: [], utilities: [] }.',
    );
  }

  return candidate as UtilityRegistry;
}

/** Install command for a package, using npm syntax. */
export function installCommand(packageName: string): string {
  return `npm install ${packageName}`;
}

/** Ready-to-paste import statement for a utility. */
export function importStatement(utility: UtilityDoc): string {
  const typeOnly = utility.kind === 'type' ? 'type ' : '';
  return `import ${typeOnly}{ ${utility.name} } from '${utility.importPath}';`;
}

/** Utilities with this exact name, optionally narrowed to a package or import path. */
export function findUtilities(
  utilities: readonly UtilityDoc[],
  name: string,
  packageFilter?: string,
): UtilityDoc[] {
  return utilities.filter(
    (utility) =>
      utility.name === name &&
      (packageFilter === undefined || matchesPackage(utility, packageFilter)),
  );
}

/** Package overview rows with an install command. */
export function listPackages(
  packages: readonly PackageDoc[],
): (PackageDoc & { install: string })[] {
  return packages.map((pkg) => ({ ...pkg, install: installCommand(pkg.name) }));
}

/** The npm scope shared by every package (`@pixpilot`), if there is one. */
export function sharedScope(packages: readonly PackageDoc[]): string | undefined {
  const scopes = new Set(
    packages.map((pkg) =>
      pkg.name.startsWith('@') ? pkg.name.split('/')[0] : undefined,
    ),
  );
  const [scope] = scopes;

  return scopes.size === 1 ? scope : undefined;
}
