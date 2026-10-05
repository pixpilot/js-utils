import { defineConfig } from '@internal/tsdown-config';

export default defineConfig({
  entry: ['src/index.ts', 'src/node.ts'],
  dts: true,
  minify: false,
  clean: true,
  failOnWarn: false,
});
