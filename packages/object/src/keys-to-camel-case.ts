import { toCamelCase as toCamelCaseString } from '@pixpilot/string';

// Type utilities for camelCase conversion
type CamelizeSegment<S extends string> = S extends '' ? '' : Capitalize<Lowercase<S>>;

/**
 * Convert snake_case to camelCase at the type level.
 *
 * This intentionally matches the runtime behavior of `change-case`'s `camelCase`
 * for underscores:
 * - ignores leading/consecutive underscores
 * - lowercases words
 */
export type ToCamelCase<
  S extends string,
  IsFirst extends boolean = true,
> = S extends `${infer Head}_${infer Tail}`
  ? Head extends ''
    ? ToCamelCase<Tail, IsFirst>
    : `${IsFirst extends true ? Lowercase<Head> : CamelizeSegment<Head>}${ToCamelCase<Tail, false>}`
  : S extends ''
    ? ''
    : IsFirst extends true
      ? Lowercase<S>
      : CamelizeSegment<S>;

type Builtin =
  | Date
  | RegExp
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<object, unknown>
  | WeakSet<object>;

type TupleToCamelCase<T extends readonly unknown[]> = {
  [I in keyof T]: KeysToCamelCase<T[I]>;
};

export type KeysToCamelCase<T> = T extends Builtin
  ? T
  : T extends (...args: unknown[]) => unknown
    ? T
    : T extends readonly unknown[]
      ? number extends T['length']
        ? KeysToCamelCase<T[number]>[]
        : TupleToCamelCase<T>
      : T extends object
        ? {
            [K in keyof T as K extends string ? ToCamelCase<K> : K]: KeysToCamelCase<
              T[K]
            >;
          }
        : T;

export function keysToCamelCase<T>(obj: T): KeysToCamelCase<T> {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase) as KeysToCamelCase<T>;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj as KeysToCamelCase<T>;
  }

  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCaseString(key);
    result[camelKey] = keysToCamelCase(value);
  }
  return result as KeysToCamelCase<T>;
}
