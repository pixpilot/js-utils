import { defineConfig } from '@internal/tsdown-config';

export default defineConfig({
  entry: ['src/index.ts', 'src/generator/index.ts', 'src/cli.ts'],
  // ESM only: the generator uses `import.meta.url` and the server targets Node.js.
  format: ['es'],
  dts: true,
  minify: false,
  clean: true,
  platform: 'node',
});
