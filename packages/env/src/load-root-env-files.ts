import type { FindRepoRootOptions } from './find-repo-root';

import { findRepoRoot } from './find-repo-root';
import { loadEnvFiles } from './load-env-files';
import { DEFAULT_ROOT_ENV_FILES } from './root-env-files';

export interface LoadRootEnvFilesOptions extends FindRepoRootOptions {
  /** Env files to load from the repository root, highest precedence first. */
  files?: string[];
}

/**
 * Loads env files from the repository root so every app in a monorepo shares
 * one set of values.
 *
 * Never overrides: variables already set (by the shell, CI, or an app's own
 * `.env*` loading) win, and earlier files in `files` win over later ones.
 *
 * @example
 * // apps/web/next.config.ts
 * loadRootEnvFiles({ from: import.meta.url });
 *
 * @returns The repository root, or `undefined` if none was found (nothing is loaded).
 */
export function loadRootEnvFiles(
  options: LoadRootEnvFilesOptions = {},
): string | undefined {
  const { files = DEFAULT_ROOT_ENV_FILES, ...rootOptions } = options;

  const root = findRepoRoot(rootOptions);
  if (root === undefined) {
    return undefined;
  }

  loadEnvFiles({ cwd: root, files });
  return root;
}
