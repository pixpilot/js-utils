import { createJiti } from 'jiti';

// Caches off: config and catalog files change between runs in watch mode and tests.
const jiti = createJiti(import.meta.url, { moduleCache: false, fsCache: false });

/** Imports the default export of a TypeScript or JavaScript file. */
export async function importModule<T>(filePath: string): Promise<T | undefined> {
  return jiti.import<T>(filePath, { default: true });
}
