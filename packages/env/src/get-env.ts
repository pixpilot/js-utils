/* eslint-disable node/prefer-global/process */
export function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key] != null) {
    return process.env[key];
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.[key] != null) {
    return import.meta.env[key];
  }
  return undefined;
}
