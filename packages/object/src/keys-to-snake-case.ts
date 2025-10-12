import { toSnakeCase as toSnakeCaseString } from '@pixpilot/string';

export type ToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Uppercase<T> ? '_' : ''}${Lowercase<T>}${ToSnakeCase<U>}`
  : S;

export type KeysToSnakeCase<T> = {
  [K in keyof T as ToSnakeCase<string & K>]: T[K] extends Record<string, unknown>
    ? KeysToSnakeCase<T[K]>
    : T[K] extends readonly (infer U)[]
      ? U extends Record<string, unknown>
        ? readonly KeysToSnakeCase<U>[]
        : T[K]
      : T[K];
};

/**
 * Converts object keys from camelCase to snake_case recursively
 */
export function keysToSnakeCase<T>(
  obj: T,
): T extends Record<string, unknown> ? KeysToSnakeCase<T> : T {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase) as T extends Record<string, unknown>
      ? KeysToSnakeCase<T>
      : T;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj as T extends Record<string, unknown> ? KeysToSnakeCase<T> : T;
  }

  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCaseString(key);
    result[snakeKey] = keysToSnakeCase(value);
  }
  return result as T extends Record<string, unknown> ? KeysToSnakeCase<T> : T;
}
