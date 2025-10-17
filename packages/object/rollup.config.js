import path from 'node:path';
import process from 'node:process';
import rollupConfig from '@internal/rollup-config';
import { getPackages } from '@manypkg/get-packages';
import alias from '@rollup/plugin-alias';

/**
 * Creates workspace aliases that resolve to SOURCE files instead of built dist/ files
 * This prevents issues during prepublishOnly when dist folders are cleaned
 * @param {string | undefined} currentPackageName
 */
async function createSourceWorkspaceAliases(currentPackageName) {
  try {
    const { packages } = await getPackages(process.cwd());
    const aliases = [];

    for (const pkg of packages) {
      // Skip self and private packages
      if (pkg.packageJson.name !== currentPackageName && !pkg.packageJson.private) {
        // Use the regular exports field which points to source (src/index.ts)
        // @ts-ignore - exports field exists but not in type definition
        const { exports } = pkg.packageJson;
        let entryPath = 'src/index.ts'; // default fallback

        if (typeof exports === 'string') {
          entryPath = exports;
        } else if (typeof exports === 'object' && exports?.['.']) {
          // Handle conditional exports
          const dotExport = exports['.'];
          if (typeof dotExport === 'string') {
            entryPath = dotExport;
          }
        }

        aliases.push({
          find: pkg.packageJson.name,
          replacement: path.join(pkg.dir, entryPath),
        });
      }
    }

    return aliases;
  } catch {
    return [];
  }
}

const workspaceAliases = await createSourceWorkspaceAliases('@pixpilot/object');

export default rollupConfig({
  bundleDependencies: true,
  // minify: false,
  plugins: [
    // Override workspace aliases to use source files
    alias({ entries: workspaceAliases }),
  ],
});
