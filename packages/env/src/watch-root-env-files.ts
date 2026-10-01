import type { FindRepoRootOptions } from './find-repo-root';
import { watch } from 'node:fs';

import { findRepoRoot } from './find-repo-root';
import { DEFAULT_ROOT_ENV_FILES } from './root-env-files';

const DEFAULT_DEBOUNCE_MS = 300;

export interface WatchRootEnvFilesOptions extends FindRepoRootOptions {
  /** Env file names in the repository root to watch. Nested paths are not watched. */
  files?: string[];
  /** Quiet period before `onChange` fires, collapsing bursts of change events. */
  debounceMs?: number;
  /** Called once per burst of changes, with the last changed file name. */
  onChange: (file: string) => void;
}

/**
 * Watches env files in the repository root and calls `onChange` when any of them changes.
 * The watcher does not keep the process alive.
 *
 * @returns A function that stops watching. A no-op if no repository root was found.
 */
export function watchRootEnvFiles(options: WatchRootEnvFilesOptions): () => void {
  const {
    files = DEFAULT_ROOT_ENV_FILES,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    onChange,
    ...rootOptions
  } = options;

  const root = findRepoRoot(rootOptions);
  if (root === undefined) {
    return () => {};
  }

  let timer: NodeJS.Timeout | undefined;

  const watcher = watch(root, (_event, filename) => {
    if (filename == null || !files.includes(filename)) {
      return;
    }

    clearTimeout(timer);
    timer = setTimeout(onChange, debounceMs, filename);
    timer.unref();
  });
  // An unhandled watcher error (e.g. the root directory was removed) would crash the process.
  watcher.on('error', () => {
    clearTimeout(timer);
    watcher.close();
  });
  watcher.unref();

  return () => {
    clearTimeout(timer);
    watcher.close();
  };
}
