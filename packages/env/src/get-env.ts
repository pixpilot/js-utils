/* eslint-disable node/prefer-global/process */
/**
 * Read an environment variable from `process.env` (Node.js) or, failing that,
 * `import.meta.env` (Vite and other bundlers).
 *
 * @param key - The variable name
 * @returns The value, or `undefined` when the variable is not set
 *
 * @example
 * ```typescript
 * const apiUrl = getEnv('API_URL') ?? 'http://localhost:3000';
 * ```
 */
export function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key] != null) {
    return process.env[key];
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.[key] != null) {
    return import.meta.env[key];
  }
  return undefined;
}
