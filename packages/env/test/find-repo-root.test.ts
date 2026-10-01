import type { FindRepoRootOptions } from '../src/find-repo-root';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findRepoRoot } from '../src/find-repo-root';

describe('findRepoRoot', () => {
  let repoRoot: string;
  let appDir: string;
  let appConfigFile: string;

  beforeEach(() => {
    repoRoot = mkdtempSync(join(tmpdir(), 'find-repo-root-'));
    appDir = join(repoRoot, 'apps', 'web');
    appConfigFile = join(appDir, 'next.config.ts');
    mkdirSync(appDir, { recursive: true });
    writeFileSync(appConfigFile, '');
    writeFileSync(join(repoRoot, 'pnpm-workspace.yaml'), '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(repoRoot, { recursive: true, force: true });
  });

  it('should accept a file URL string like import.meta.url', () => {
    expect(findRepoRoot({ from: pathToFileURL(appConfigFile).href })).toBe(repoRoot);
  });

  it('should accept a URL object', () => {
    expect(findRepoRoot({ from: pathToFileURL(appConfigFile) })).toBe(repoRoot);
  });

  it('should accept a plain file system path', () => {
    expect(findRepoRoot({ from: appDir })).toBe(repoRoot);
  });

  it('should default to searching from process.cwd()', () => {
    vi.spyOn(process, 'cwd').mockReturnValue(appDir);

    expect(findRepoRoot()).toBe(repoRoot);
  });

  it('should use custom root markers', () => {
    writeFileSync(join(appDir, 'marker'), '');
    const options: FindRepoRootOptions = { from: appConfigFile, rootMarkers: ['marker'] };

    expect(findRepoRoot(options)).toBe(appDir);
  });

  it('should return undefined when no root is found', () => {
    expect(
      findRepoRoot({ from: appDir, rootMarkers: ['does-not-exist'] }),
    ).toBeUndefined();
  });
});
