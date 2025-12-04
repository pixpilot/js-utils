import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/* eslint-disable node/prefer-global/process */
/**
 * Loads environment variables from .env files.
 * Variables from later files in the list will override those from earlier files.
 * Existing environment variables are not overridden.
 *
 * @param options - Configuration options
 * @param options.files - Array of file paths to load (defaults to ['.env.local', '.env'])
 * @param options.keys - Array of specific keys to load (loads all if not specified)
 */
export function loadEnvFiles(options?: { keys?: string[]; files?: string[] }): void {
  const envFiles = options?.files ?? ['.env.local', '.env', '.env.secret'];

  for (const file of envFiles) {
    const filePath = join(process.cwd(), file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          const trimmedKey = key?.trim();
          if (trimmedKey != null && trimmedKey.length > 0 && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            // If keys are specified, only load those keys
            if (!options?.keys || options.keys.includes(trimmedKey)) {
              if (process.env[trimmedKey] == null) {
                process.env[trimmedKey] = value;
              }
            }
          }
        }
      }
    }
  }
}
