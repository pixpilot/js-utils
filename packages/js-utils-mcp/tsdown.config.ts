import { defineConfig } from '@internal/tsdown-config';

const KB = 1024;
// The bundled registry.json makes up most of the output.
const MAX_BUNDLE_SIZE_KB = 400;

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  // ESM only: the bin uses top-level await and the server targets Node.js.
  format: ['es'],
  // Bundle the @pixpilot/mcp runtime so installs skip the generator's dependencies
  // (jiti, TypeScript) and the dist also runs inside this monorepo, where workspace
  // packages resolve to TypeScript sources.
  unbundle: false,
  noExternal: ['@pixpilot/mcp'],
  dts: true,
  minify: false,
  clean: true,
  platform: 'node',
  bundleSize: MAX_BUNDLE_SIZE_KB * KB,
});
