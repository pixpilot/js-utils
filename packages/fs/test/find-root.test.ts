import type { FindRootCheck } from '../src/find-root';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, parse, relative } from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findRoot } from '../src/find-root';

describe('findRoot', () => {
  let tempDir: string;
  let projectDir: string;
  let nestedDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'find-root-'));
    projectDir = join(tempDir, 'project');
    nestedDir = join(projectDir, 'src', 'nested');
    mkdirSync(nestedDir, { recursive: true });
    writeFileSync(join(projectDir, 'package.json'), '{}');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return the start directory when it contains package.json', () => {
    expect(findRoot(projectDir)).toBe(projectDir);
  });

  it('should walk up to the nearest ancestor containing package.json', () => {
    expect(findRoot(nestedDir)).toBe(projectDir);
  });

  it('should return the closest package root when roots are nested', () => {
    const innerPackageDir = join(projectDir, 'src');
    writeFileSync(join(innerPackageDir, 'package.json'), '{}');

    expect(findRoot(nestedDir)).toBe(innerPackageDir);
  });

  it('should accept a file path as the start', () => {
    const filePath = join(nestedDir, 'file.ts');
    writeFileSync(filePath, '');

    expect(findRoot(filePath)).toBe(projectDir);
  });

  it('should resolve a relative start path against the cwd', () => {
    expect(findRoot(relative(process.cwd(), nestedDir))).toBe(projectDir);
  });

  it('should ignore a trailing path separator on the start path', () => {
    expect(findRoot(`${nestedDir}/`)).toBe(projectDir);
  });

  it('should default to process.cwd() when no start is given', () => {
    vi.spyOn(process, 'cwd').mockReturnValue(nestedDir);

    expect(findRoot()).toBe(projectDir);
  });

  it('should use a custom check function', () => {
    const check: FindRootCheck = (dir) => dir.endsWith('src');

    expect(findRoot(nestedDir, check)).toBe(join(projectDir, 'src'));
  });

  it('should visit directories from start upwards', () => {
    const visited: string[] = [];
    const check: FindRootCheck = (dir) => {
      visited.push(dir);
      return dir === projectDir;
    };

    findRoot(nestedDir, check);

    expect(visited).toEqual([nestedDir, join(projectDir, 'src'), projectDir]);
  });

  it('should treat a throwing check as a non-match and keep walking up', () => {
    const check: FindRootCheck = (dir) => {
      if (dir === nestedDir) {
        throw new Error('boom');
      }
      return dir === projectDir;
    };

    expect(findRoot(nestedDir, check)).toBe(projectDir);
  });

  it('should check the filesystem root before giving up', () => {
    const { root } = parse(nestedDir);

    expect(findRoot(nestedDir, (dir) => dir === root)).toBe(root);
  });

  it('should throw when no directory matches', () => {
    expect(() => findRoot(nestedDir, () => false)).toThrow(/Root not found/u);
  });
});
