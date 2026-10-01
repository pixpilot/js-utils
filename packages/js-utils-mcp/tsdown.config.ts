import { defineConfig } from '@internal/tsdown-config';

const KB = 1024;
// The bundled registry.json makes up most of the output.
const MAX_BUNDLE_SIZE_KB = 400;

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  // ESM only: the bin uses top-level await and the server targets Node.js.
  format: ['es'],
  dts: true,
  minify: false,
  clean: true,
  platform: 'node',
  bundleSize: MAX_BUNDLE_SIZE_KB * KB,
});
