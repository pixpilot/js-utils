import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadEnvFiles } from '../src/load-env-files';

const directories: string[] = [];
afterEach(() => {
  vi.unstubAllEnvs();
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});
describe('dotenv file syntax', () => {
  it('should parse quoted URLs, inline comments, export prefixes, and multiline values', () => {
    const directory = mkdtempSync(join(tmpdir(), 'env-format-test-'));
    directories.push(directory);
    const file = join(directory, '.env');
    writeFileSync(
      file,
      [
        'FORMAT_URL="postgresql://user:pass@localhost/db" # migration connection',
        "FORMAT_SINGLE='value # retained'",
        'export FORMAT_EXPORTED=hello # ignored',
        'FORMAT_MULTILINE="first\nsecond"',
      ].join('\n'),
    );
    for (const key of [
      'FORMAT_URL',
      'FORMAT_SINGLE',
      'FORMAT_EXPORTED',
      'FORMAT_MULTILINE',
    ]) {
      vi.stubEnv(key, undefined);
    }
    loadEnvFiles({ cwd: directory, files: ['.env'] });
    expect(process.env['FORMAT_URL']).toBe('postgresql://user:pass@localhost/db');
    expect(process.env['FORMAT_SINGLE']).toBe('value # retained');
    expect(process.env['FORMAT_EXPORTED']).toBe('hello');
    expect(process.env['FORMAT_MULTILINE']).toBe('first\nsecond');
  });
  it('should support absolute file paths and preserve shell-variable precedence', () => {
    const directory = mkdtempSync(join(tmpdir(), 'env-absolute-test-'));
    directories.push(directory);
    const file = join(directory, '.env');
    writeFileSync(file, 'FORMAT_SHELL=file\nFORMAT_ABSOLUTE=value\n');
    vi.stubEnv('FORMAT_SHELL', 'shell');
    vi.stubEnv('FORMAT_ABSOLUTE', undefined);
    loadEnvFiles({ cwd: join(directory, 'nested'), files: [file] });
    expect(process.env['FORMAT_SHELL']).toBe('shell');
    expect(process.env['FORMAT_ABSOLUTE']).toBe('value');
  });
});
