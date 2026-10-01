import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Version from the nearest package.json above a module, so a bin reports the
 * version of the package that ships it, from both `src` and `dist`.
 *
 * @example
 * ```typescript
 * const version = readPackageVersion(import.meta.url);
 * ```
 */
export function readPackageVersion(moduleUrl: string): string {
  let dir = path.dirname(fileURLToPath(moduleUrl));

  while (true) {
    const manifestPath = path.join(dir, 'package.json');

    if (existsSync(manifestPath)) {
      try {
        const { version } = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
          version?: string;
        };
        return version ?? '0.0.0';
      } catch {
        return '0.0.0';
      }
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      return '0.0.0';
    }
    dir = parent;
  }
}
