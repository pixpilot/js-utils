import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadEnvFiles } from '../src/load-env-files';

// Mock fs and path
vi.mock('node:fs');
vi.mock('node:path');

// Mock process.cwd
const mockCwd = vi.fn();

describe('loadEnvFiles', () => {
  const originalProcess = globalThis.process;

  beforeEach(() => {
    // Mock process.cwd
    process.cwd = mockCwd;
    mockCwd.mockReturnValue('/test/dir');

    // Reset environment variables
    delete process.env['TEST_KEY'];
    delete process.env['ANOTHER_KEY'];
    delete process.env['THIRD_KEY'];
    delete process.env['CUSTOM_KEY'];
    delete process.env['SHARED_KEY'];
    delete process.env['LOCAL_KEY'];
    delete process.env['KEY_WITH_EQUALS'];
    delete process.env['KEY_NO_VALUE'];
  });

  afterEach(() => {
    // Restore original process
    globalThis.process = originalProcess;
    vi.restoreAllMocks();
  });

  it('should load variables from .env file', () => {
    // Mock file exists
    vi.mocked(existsSync).mockImplementation((path) => path === '/test/dir/.env');
    vi.mocked(readFileSync).mockReturnValue(
      'TEST_KEY=value1\nANOTHER_KEY=value2\n# comment\n\n',
    );
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles();

    expect(process.env['TEST_KEY']).toBe('value1');
    expect(process.env['ANOTHER_KEY']).toBe('value2');
  });

  it('should load variables from .env.local file and override .env', () => {
    // Mock both files exist
    vi.mocked(existsSync).mockImplementation(
      (path) => path === '/test/dir/.env' || path === '/test/dir/.env.local',
    );
    vi.mocked(readFileSync).mockImplementation((path) => {
      if (path === '/test/dir/.env') return 'TEST_KEY=env_value\nSHARED_KEY=env_shared\n';
      if (path === '/test/dir/.env.local')
        return 'TEST_KEY=local_value\nLOCAL_KEY=local_only\n';
      return '';
    });
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles();

    expect(process.env['TEST_KEY']).toBe('local_value'); // overridden
    expect(process.env['SHARED_KEY']).toBe('env_shared');
    expect(process.env['LOCAL_KEY']).toBe('local_only');
  });

  it('should not override existing environment variables', () => {
    // Set existing env var
    process.env['TEST_KEY'] = 'existing_value';

    vi.mocked(existsSync).mockImplementation((path) => path === '/test/dir/.env');
    vi.mocked(readFileSync).mockReturnValue('TEST_KEY=new_value\n');
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles();

    expect(process.env['TEST_KEY']).toBe('existing_value'); // not overridden
  });

  it('should handle files that do not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles();

    // No env vars should be set
    expect(process.env['TEST_KEY']).toBeUndefined();
  });

  it('should handle malformed lines', () => {
    vi.mocked(existsSync).mockImplementation((path) => path === '/test/dir/.env');
    vi.mocked(readFileSync).mockReturnValue(
      '=no_key\nKEY_NO_VALUE\nKEY_WITH_EQUALS=key=value\n',
    );
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles();

    expect(process.env['KEY_WITH_EQUALS']).toBe('key=value');
    expect(process.env['KEY_NO_VALUE']).toBeUndefined();
    expect(process.env['no_key']).toBeUndefined();
  });

  it('should load only specified keys when keys parameter is provided', () => {
    vi.mocked(existsSync).mockImplementation((path) => path === '/test/dir/.env');
    vi.mocked(readFileSync).mockReturnValue(
      'TEST_KEY=value1\nANOTHER_KEY=value2\nTHIRD_KEY=value3\n',
    );
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles({ keys: ['TEST_KEY', 'THIRD_KEY'] });

    expect(process.env['TEST_KEY']).toBe('value1');
    expect(process.env['ANOTHER_KEY']).toBeUndefined();
    expect(process.env['THIRD_KEY']).toBe('value3');
  });

  it('should load all keys when no keys parameter is provided', () => {
    vi.mocked(existsSync).mockImplementation((path) => path === '/test/dir/.env');
    vi.mocked(readFileSync).mockReturnValue('TEST_KEY=value1\nANOTHER_KEY=value2\n');
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles();

    expect(process.env['TEST_KEY']).toBe('value1');
    expect(process.env['ANOTHER_KEY']).toBe('value2');
  });

  it('should load from custom files when files parameter is provided', () => {
    vi.mocked(existsSync).mockImplementation((path) => path === '/test/dir/.custom.env');
    vi.mocked(readFileSync).mockReturnValue('CUSTOM_KEY=custom_value\n');
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles({ files: ['.custom.env'] });

    expect(process.env['CUSTOM_KEY']).toBe('custom_value');
  });

  it('should load from multiple custom files with override behavior', () => {
    vi.mocked(existsSync).mockImplementation(
      (path) => path === '/test/dir/.env' || path === '/test/dir/.env.local',
    );
    vi.mocked(readFileSync).mockImplementation((path) => {
      if (path === '/test/dir/.env') return 'SHARED_KEY=env_value\n';
      if (path === '/test/dir/.env.local') return 'SHARED_KEY=local_value\n';
      return '';
    });
    vi.mocked(join).mockImplementation((...args) => args.join('/').replace('//', '/'));

    loadEnvFiles({ files: ['.env.local', '.env'] });

    expect(process.env['SHARED_KEY']).toBe('local_value'); // .env.local loaded first, .env doesn't override
  });
});
