import { existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { findRoot } from '@pixpilot/fs';

const DEFAULT_ROOT_MARKERS = ['pnpm-workspace.yaml', '.git'];

export interface FindRepoRootOptions {
  /**
   * Where to start searching for the repository root: a file or directory path,
   * or a file URL such as `import.meta.url`. Defaults to `process.cwd()`.
   */
  from?: string | URL;
  /** Files or directories whose presence marks the repository root. */
  rootMarkers?: string[];
}

function toPath(from: string | URL): string {
  return from instanceof URL || from.startsWith('file:') ? fileURLToPath(from) : from;
}

/**
 * Walks up from `from` to the nearest directory containing one of `rootMarkers`.
 *
 * @returns The repository root, or `undefined` if none was found.
 *
 * @example
 * ```typescript
 * findRepoRoot(); // nearest dir with pnpm-workspace.yaml or .git, from process.cwd()
 * findRepoRoot({ from: import.meta.url, rootMarkers: ['turbo.json'] });
 * ```
 */
export function findRepoRoot(options: FindRepoRootOptions = {}): string | undefined {
  const { from = process.cwd(), rootMarkers = DEFAULT_ROOT_MARKERS } = options;

  try {
    return findRoot(toPath(from), (dir) =>
      rootMarkers.some((marker) => existsSync(join(dir, marker))),
    );
  } catch {
    return undefined;
  }
}
