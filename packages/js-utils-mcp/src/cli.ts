#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { startServer } from './server';

// Same relative path from `src/cli.ts` (dev) and `dist/cli.js` (published).
function readVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

await startServer(readVersion());
