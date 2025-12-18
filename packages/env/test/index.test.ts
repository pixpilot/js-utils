import { builtinModules } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { describe, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function forbidNodeBuiltinsPlugin() {
  const nodeBuiltins = new Set<string>();

  for (const moduleId of builtinModules) {
    nodeBuiltins.add(moduleId);
    if (moduleId.startsWith('node:')) {
      nodeBuiltins.add(moduleId.slice('node:'.length));
    } else {
      nodeBuiltins.add(`node:${moduleId}`);
    }
  }

  return {
    name: 'forbid-node-builtins',
    setup(esbuildBuild: import('esbuild').PluginBuild) {
      // eslint-disable-next-line require-unicode-regexp
      esbuildBuild.onResolve({ filter: /.*/ }, (args) => {
        const id = args.path;
        const baseId = id.split('/')[0] ?? id;

        const isNodeBuiltin =
          id.startsWith('node:') ||
          nodeBuiltins.has(id) ||
          nodeBuiltins.has(baseId) ||
          nodeBuiltins.has(`node:${baseId}`);

        if (isNodeBuiltin) {
          return {
            errors: [
              {
                text: `Node.js builtin import is not allowed in browser-safe entrypoint: ${id}`,
              },
            ],
          };
        }

        return undefined;
      });
    },
  } satisfies import('esbuild').Plugin;
}

describe('browser safety', () => {
  it('public entrypoint does not import Node.js builtins', async () => {
    await expect(
      build({
        entryPoints: [resolve(__dirname, '../src/index.ts')],
        bundle: true,
        write: false,
        platform: 'browser',
        format: 'esm',
        logLevel: 'silent',
        plugins: [forbidNodeBuiltinsPlugin()],
      }),
    ).resolves.toBeDefined();
  });
});
