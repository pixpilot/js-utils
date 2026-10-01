import type { LoadRootEnvFilesOptions } from '../src/load-root-env-files';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadRootEnvFiles } from '../src/load-root-env-files';

const KEYS = ['ROOT_ONLY', 'SHARED', 'PRESET'] as const;

function clearKeys(): void {
  for (const key of KEYS) {
    delete process.env[key];
  }
}

describe('loadRootEnvFiles', () => {
  let repoRoot: string;
  let appDir: string;

  beforeEach(() => {
    repoRoot = mkdtempSync(join(tmpdir(), 'load-root-env-'));
    appDir = join(repoRoot, 'apps', 'web');
    mkdirSync(appDir, { recursive: true });
    writeFileSync(join(repoRoot, 'pnpm-workspace.yaml'), '');
    writeFileSync(join(repoRoot, '.env'), 'ROOT_ONLY=from-env\nSHARED=from-env\n');
    writeFileSync(join(repoRoot, '.env.local'), 'SHARED=from-local\n');
    clearKeys();
  });

  afterEach(() => {
    rmSync(repoRoot, { recursive: true, force: true });
    clearKeys();
  });

  it('should load root env files when given import.meta.url of a nested file', () => {
    const configUrl = pathToFileURL(join(appDir, 'next.config.ts')).href;

    expect(loadRootEnvFiles({ from: configUrl })).toBe(repoRoot);
    expect(process.env['ROOT_ONLY']).toBe('from-env');
  });

  it('should give .env.local precedence over .env', () => {
    loadRootEnvFiles({ from: appDir });

    expect(process.env['SHARED']).toBe('from-local');
  });

  it('should not override variables that are already set', () => {
    process.env['PRESET'] = 'from-shell';
    writeFileSync(join(repoRoot, '.env'), 'PRESET=from-env\n');

    loadRootEnvFiles({ from: appDir });

    expect(process.env['PRESET']).toBe('from-shell');
  });

  it('should load only the requested files', () => {
    const options: LoadRootEnvFilesOptions = { from: appDir, files: ['.env'] };

    loadRootEnvFiles(options);

    expect(process.env['SHARED']).toBe('from-env');
  });

  it('should load from the directory matched by custom root markers', () => {
    writeFileSync(join(appDir, 'marker'), '');
    writeFileSync(join(appDir, '.env'), 'ROOT_ONLY=from-app\n');

    expect(loadRootEnvFiles({ from: appDir, rootMarkers: ['marker'] })).toBe(appDir);
    expect(process.env['ROOT_ONLY']).toBe('from-app');
  });

  it('should return undefined and load nothing when no root is found', () => {
    const root = loadRootEnvFiles({ from: appDir, rootMarkers: ['does-not-exist'] });

    expect(root).toBeUndefined();
    expect(process.env['ROOT_ONLY']).toBeUndefined();
  });
});
