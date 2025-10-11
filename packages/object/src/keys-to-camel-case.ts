import { toCamelCase as toCamelCaseString } from '@pixpilot/string';

// Type utilities for camelCase conversion
type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
  : S;

type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, unknown>
    ? KeysToCamelCase<T[K]>
    : T[K] extends readonly (infer U)[]
      ? U extends Record<string, unknown>
        ? readonly KeysToCamelCase<U>[]
        : T[K]
      : T[K];
};

export function keysToCamelCase<T>(
  obj: T,
): T extends Record<string, unknown> ? KeysToCamelCase<T> : T {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase) as T extends Record<string, unknown>
      ? KeysToCamelCase<T>
      : T;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj as T extends Record<string, unknown> ? KeysToCamelCase<T> : T;
  }

  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCaseString(key);
    result[camelKey] = keysToCamelCase(value);
  }
  return result as T extends Record<string, unknown> ? KeysToCamelCase<T> : T;
}
