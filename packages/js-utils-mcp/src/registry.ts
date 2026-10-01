import type { PackageDoc, UtilityDoc, UtilityRegistry } from './types';
import registryJson from './generated/registry.json';
import { matchesPackage } from './search';

/** Generated catalog of every @pixpilot utility. Regenerate with `pnpm mcp:generate`. */
export const registry = registryJson as UtilityRegistry;

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
