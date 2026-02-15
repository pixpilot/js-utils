import { toSnakeCase as toSnakeCaseString } from '@pixpilot/string';

/**
 * Convert camelCase to snake_case at the type level.
 *
 * This intentionally matches the runtime behavior of `change-case`'s `snakeCase`
 * for camelCase conversion: inserts underscores before uppercase letters and lowercases.
 */
export type ToSnakeCase<S extends string> = S extends `${infer P1}${infer P2}${infer P3}`
  ? P1 extends Lowercase<P1>
    ? P2 extends Uppercase<P2>
      ? `${P1}_${ToSnakeCase<`${Lowercase<P2>}${P3}`>}`
      : `${P1}${ToSnakeCase<`${P2}${P3}`>}`
    : S
  : S;

type Builtin =
  | Date
  | RegExp
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<object, unknown>
  | WeakSet<object>;

type TupleToSnakeCase<T extends readonly unknown[]> = {
  [I in keyof T]: KeysToSnakeCase<T[I]>;
};

export type KeysToSnakeCase<T> = T extends Builtin
  ? T
  : T extends (...args: unknown[]) => unknown
    ? T
    : T extends readonly unknown[]
      ? number extends T['length']
        ? KeysToSnakeCase<T[number]>[]
        : TupleToSnakeCase<T>
      : T extends object
        ? {
            [K in keyof T as K extends string ? ToSnakeCase<K> : K]: KeysToSnakeCase<
              T[K]
            >;
          }
        : T;

/**
 * Converts object keys from camelCase to snake_case recursively
 */
export function keysToSnakeCase<T>(obj: T): KeysToSnakeCase<T> {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase) as KeysToSnakeCase<T>;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj as KeysToSnakeCase<T>;
  }

  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCaseString(key);
    result[snakeKey] = keysToSnakeCase(value);
  }
  return result as KeysToSnakeCase<T>;
}
