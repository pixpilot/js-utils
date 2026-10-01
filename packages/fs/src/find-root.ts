/**
 * Inspired by https://github.com/js-n/find-root
 */

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

export type FindRootCheck = (dir: string) => boolean;

function hasPackageJson(dir: string): boolean {
  return existsSync(join(dir, 'package.json'));
}

/**
 * Walks up the directory tree from `start` and returns the first directory
 * that satisfies `check`. Errors thrown by `check` are treated as a non-match.
 *
 * @param start - Directory (or file path) to start from. Defaults to `process.cwd()`.
 * @param check - Predicate run on each directory. Defaults to "contains a package.json".
 * @returns The absolute path of the first matching directory.
 * @throws If no matching directory is found before reaching the filesystem root.
 */
export function findRoot(
  start: string = process.cwd(),
  check: FindRootCheck = hasPackageJson,
): string {
  let dir = resolve(start);

  while (true) {
    try {
      if (check(dir)) {
        return dir;
      }
    } catch {
      // Treat a throwing check as a non-match and keep walking up.
    }

    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`Root not found walking up from "${start}"`);
    }
    dir = parent;
  }
}
