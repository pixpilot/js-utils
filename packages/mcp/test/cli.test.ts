import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';
import { createTempWorkspace, fixtureWorkspaceFiles } from './helpers';

const TIMEOUT_MS = 60_000;
const CLI = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
const TSX_CLI = createRequire(import.meta.url).resolve('tsx/cli');
const PRETTIER_PARENT_DIR = fileURLToPath(new URL('../.cache/fixtures', import.meta.url));

let cleanup: (() => void) | undefined;

async function run(args: readonly string[], cwd: string) {
  try {
    const { stdout, stderr } = await promisify(execFile)(
      process.execPath,
      [TSX_CLI, CLI, ...args],
      { cwd },
    );
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failed = error as { code: number; stdout: string; stderr: string };
    return { code: failed.code, stdout: failed.stdout, stderr: failed.stderr };
  }
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('pixpilot-mcp CLI', () => {
  it(
    'prints help without a command',
    async () => {
      const { code, stdout } = await run([], process.cwd());

      expect(code).toBe(0);
      expect(stdout).toContain('Usage: pixpilot-mcp generate');
    },
    TIMEOUT_MS,
  );

  it(
    'generates, then passes and fails --check as the sources change',
    async () => {
      const workspace = createTempWorkspace(fixtureWorkspaceFiles());
      cleanup = workspace.cleanup;
      const configDir = path.join(workspace.root, 'packages/mcp-server');

      const missing = await run(['generate', '--check'], configDir);
      expect(missing.code).toBe(1);
      expect(missing.stderr).toContain('src/generated/registry.json is out of date');

      const generated = await run(['generate'], configDir);
      expect(generated.code).toBe(0);
      expect(generated.stdout).toContain('5 utilities from 2 packages');
      expect(existsSync(path.join(configDir, 'src/generated/registry.json'))).toBe(true);

      const fresh = await run(
        ['generate', '--check', '--config', configDir],
        workspace.root,
      );
      expect(fresh.code).toBe(0);
      expect(fresh.stdout).toContain('is up to date');

      workspace.write(
        'packages/text/src/index.ts',
        '/**\n * Whisper.\n *\n * @example\n * whisper();\n */\nexport function whisper(): void {}\n',
      );
      workspace.write(
        'packages/mcp-server/catalog/text.ts',
        "export default { category: 'Text' };\n",
      );

      const stale = await run(['generate', '--check'], configDir);
      expect(stale.code).toBe(1);
      expect(stale.stderr).toContain('added @fx/text › whisper: whisper(): void');
      expect(stale.stderr).toContain('removed @fx/text › shout');
    },
    TIMEOUT_MS,
  );

  it(
    "formats the registry with the consumer's Prettier and config",
    async () => {
      // Inside this package, so Prettier and its config resolve from the workspace.
      const workspace = createTempWorkspace(fixtureWorkspaceFiles(), PRETTIER_PARENT_DIR);
      cleanup = workspace.cleanup;
      const configDir = path.join(workspace.root, 'packages/mcp-server');

      const { code, stderr } = await run(['generate'], configDir);

      expect(stderr).toBe('');
      expect(code).toBe(0);
      expect(
        readFileSync(path.join(configDir, 'src/generated/registry.json'), 'utf8'),
      ).toContain('"keywords": ["uppercase"]');
    },
    TIMEOUT_MS,
  );

  it(
    'rejects unknown commands',
    async () => {
      const { code, stderr } = await run(['build'], process.cwd());

      expect(code).toBe(1);
      expect(stderr).toContain('Unknown command "build"');
    },
    TIMEOUT_MS,
  );
});
