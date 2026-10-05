import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { parse } from 'dotenv';

/* eslint-disable node/prefer-global/process */
/**
 * Loads environment variables from .env files into `process.env`.
 * Earlier files in the list take precedence over later ones, and variables that
 * are already set are never overridden.
 *
 * @param options - Configuration options
 * @param options.files - Array of file paths to load (defaults to ['.env.local', '.env', '.env.secret'])
 * @param options.keys - Array of specific keys to load (loads all if not specified)
 * @param options.cwd - Directory the files are resolved against (defaults to process.cwd())
 *
 * @example
 * ```typescript
 * loadEnvFiles(); // .env.local, .env and .env.secret from process.cwd()
 * loadEnvFiles({ files: ['.env.test'], keys: ['DATABASE_URL'] });
 * ```
 */
export function loadEnvFiles(options?: {
  keys?: string[];
  files?: string[];
  cwd?: string;
}): void {
  const envFiles = options?.files ?? ['.env.local', '.env', '.env.secret'];
  const cwd = options?.cwd ?? process.cwd();

  for (const file of envFiles) {
    const filePath = isAbsolute(file) ? file : join(cwd, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      for (const [key, value] of Object.entries(parse(content))) {
        if (options?.keys === undefined || options.keys.includes(key)) {
          process.env[key] ??= value;
        }
      }
    }
  }
}
