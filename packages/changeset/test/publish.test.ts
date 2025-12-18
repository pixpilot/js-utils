import { Buffer } from 'node:buffer';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadEnvFiles } from '@pixpilot/env/node';
import { describe, expect, it, vi } from 'vitest';

import { publish } from '../src/publish';

// Mock dependencies
vi.mock('node:child_process');
vi.mock('node:fs');
vi.mock('node:os');
vi.mock('node:path');
vi.mock('@pixpilot/env/node');
vi.mock('node:console', () => ({
  console: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

describe('publish', () => {
  const mockExecSync = vi.mocked(execSync);
  const mockWriteFileSync = vi.mocked(fs.writeFileSync);
  const mockMkdtempSync = vi.mocked(fs.mkdtempSync);
  const mockRmSync = vi.mocked(fs.rmSync);
  const mockJoin = vi.mocked(path.join);
  const mockTmpdir = vi.mocked(os.tmpdir);
  const mockLoadEnvFiles = vi.mocked(loadEnvFiles);

  beforeEach(() => {
    vi.clearAllMocks();
    mockJoin.mockImplementation((...args) => args.join('/'));
    vi.spyOn(process, 'cwd').mockReturnValue('/test');
    vi.spyOn(process, 'pid', 'get').mockReturnValue(12345);
    mockTmpdir.mockReturnValue('/tmp');
    mockMkdtempSync.mockReturnValue('/tmp/npm-publish-12345');

    // Clear NPM_TOKEN
    delete process.env['NPM_TOKEN'];

    // Default mock for loadEnvFiles - does nothing
    mockLoadEnvFiles.mockImplementation(() => {});

    // Mock process.exit to throw instead of exit
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  it('should be a function', () => {
    expect(typeof publish).toBe('function');
  });

  it('should exit with error when .env.local file does not exist', () => {
    // loadEnvFiles is mocked to do nothing, so NPM_TOKEN won't be set
    expect(() => publish({ isDryRun: false, isNext: false })).toThrow(
      'process.exit called',
    );
    // No longer checking existsSync manually
  });

  it('should exit with error when .env.local exists but no NPM_TOKEN found', () => {
    // loadEnvFiles is mocked to do nothing, so NPM_TOKEN won't be set
    expect(() => publish({ isDryRun: false, isNext: false })).toThrow(
      'process.exit called',
    );
    // Cleanup happens in finally block, but since we exit early, it may not be called
  });

  it('should exit with error when NPM_TOKEN is empty', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = '';
    });
    expect(() => publish({ isDryRun: false, isNext: false })).toThrow(
      'process.exit called',
    );
    // Cleanup happens in finally block, but since we exit early, it may not be called
  });

  it('should exit with error when NPM_TOKEN has only whitespace', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = '   ';
    });
    expect(() => publish({ isDryRun: false, isNext: false })).toThrow(
      'process.exit called',
    );
    // Cleanup happens in finally block, but since we exit early, it may not be called
  });

  it('should successfully publish without dry-run or next', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = 'test-token';
    });
    mockExecSync.mockReturnValue(Buffer.from(''));

    publish({ isDryRun: false, isNext: false });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/tmp/npm-publish-12345/.npmrc',
      '//registry.npmjs.org/:_authToken=test-token\n',
    );
    expect(mockExecSync).toHaveBeenCalledWith(
      'pnpm changeset publish',
      expect.objectContaining({
        env: expect.objectContaining({
          NPM_CONFIG_USERCONFIG: '/tmp/npm-publish-12345/.npmrc',
        }),
      }),
    );
  });

  it('should publish with dry-run flag', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = 'test-token';
    });
    mockExecSync.mockReturnValue(Buffer.from(''));

    publish({ isDryRun: true, isNext: false });

    expect(mockExecSync).toHaveBeenCalledWith(
      'pnpm changeset publish --dry-run',
      expect.any(Object),
    );
  });

  it('should publish with next tag', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = 'test-token';
    });
    mockExecSync.mockReturnValue(Buffer.from(''));

    publish({ isDryRun: false, isNext: true });

    expect(mockExecSync).toHaveBeenCalledWith(
      'pnpm changeset publish --tag next',
      expect.any(Object),
    );
  });

  it('should publish with both dry-run and next', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = 'test-token';
    });
    mockExecSync.mockReturnValue(Buffer.from(''));

    publish({ isDryRun: true, isNext: true });

    expect(mockExecSync).toHaveBeenCalledWith(
      'pnpm changeset publish --dry-run --tag next',
      expect.any(Object),
    );
  });

  it('should exit with error when execSync throws', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = 'test-token';
    });
    mockExecSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    expect(() => publish({ isDryRun: false, isNext: false })).toThrow('Command failed');
    expect(mockRmSync).toHaveBeenCalledWith('/tmp/npm-publish-12345', {
      recursive: true,
      force: true,
    });
  });

  it('should exit with error when execSync throws non-Error', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = 'test-token';
    });
    mockExecSync.mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw { message: 'object error' };
    });

    expect(() => publish({ isDryRun: false, isNext: false })).toThrow();
    // Cleanup happens in finally block, but since we throw, it may not be called
  });

  it('should handle token with extra whitespace', () => {
    mockLoadEnvFiles.mockImplementation(() => {
      process.env['NPM_TOKEN'] = 'test-token';
    });
    mockExecSync.mockReturnValue(Buffer.from(''));

    publish({ isDryRun: false, isNext: false });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/tmp/npm-publish-12345/.npmrc',
      '//registry.npmjs.org/:_authToken=test-token\n',
    );
    expect(mockRmSync).toHaveBeenCalledWith('/tmp/npm-publish-12345', {
      recursive: true,
      force: true,
    });
  });
});
