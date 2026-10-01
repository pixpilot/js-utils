import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchRootEnvFiles } from '../src/watch-root-env-files';

const DEBOUNCE_MS = 50;
const SETTLE_MS = DEBOUNCE_MS * 6;

describe('watchRootEnvFiles', () => {
  let repoRoot: string;
  let stop: (() => void) | undefined;
  const onChange = vi.fn<(file: string) => void>();

  beforeEach(() => {
    repoRoot = mkdtempSync(join(tmpdir(), 'watch-root-env-'));
    writeFileSync(join(repoRoot, 'pnpm-workspace.yaml'), '');
    onChange.mockReset();
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
    rmSync(repoRoot, { recursive: true, force: true });
  });

  it('should call onChange with the file name when a root env file changes', async () => {
    stop = watchRootEnvFiles({ from: repoRoot, debounceMs: DEBOUNCE_MS, onChange });

    writeFileSync(join(repoRoot, '.env'), 'A=1\n');

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith('.env'));
  });

  it('should ignore files that are not in the watch list', async () => {
    stop = watchRootEnvFiles({ from: repoRoot, debounceMs: DEBOUNCE_MS, onChange });

    writeFileSync(join(repoRoot, 'other.txt'), 'x');
    await sleep(SETTLE_MS);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should watch custom files', async () => {
    stop = watchRootEnvFiles({
      from: repoRoot,
      files: ['.env.custom'],
      debounceMs: DEBOUNCE_MS,
      onChange,
    });

    writeFileSync(join(repoRoot, '.env'), 'A=1\n');
    writeFileSync(join(repoRoot, '.env.custom'), 'A=1\n');

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith('.env.custom'));
    expect(onChange).not.toHaveBeenCalledWith('.env');
  });

  it('should debounce a burst of changes into one call', async () => {
    stop = watchRootEnvFiles({ from: repoRoot, debounceMs: DEBOUNCE_MS, onChange });

    writeFileSync(join(repoRoot, '.env'), 'A=1\n');
    writeFileSync(join(repoRoot, '.env.local'), 'A=2\n');
    writeFileSync(join(repoRoot, '.env'), 'A=3\n');
    await sleep(SETTLE_MS);

    expect(onChange).toHaveBeenCalledOnce();
  });

  it('should stop calling onChange after stop is called', async () => {
    stop = watchRootEnvFiles({ from: repoRoot, debounceMs: DEBOUNCE_MS, onChange });

    stop();
    writeFileSync(join(repoRoot, '.env'), 'A=1\n');
    await sleep(SETTLE_MS);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should return a no-op stop function when no root is found', () => {
    stop = watchRootEnvFiles({
      from: repoRoot,
      rootMarkers: ['does-not-exist'],
      onChange,
    });

    expect(() => stop?.()).not.toThrow();
  });
});
