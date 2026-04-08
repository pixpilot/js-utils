import { toCamelCase as toCamelCaseString } from '@pixpilot/string';

export interface KeysToCamelCaseOptions {
  shouldConvert?: (key: string) => boolean;
}

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

const FIRST_CHARACTER_INDEX = 0;
const GUID_LENGTH = '00000000-0000-0000-0000-000000000000'.length;
const GUID_SEPARATOR_CODE = '-'.charCodeAt(FIRST_CHARACTER_INDEX);
const GUID_SEPARATOR_ONE_INDEX = '00000000'.length;
const GUID_SEPARATOR_TWO_INDEX = '00000000-0000'.length;
const GUID_SEPARATOR_THREE_INDEX = '00000000-0000-0000'.length;
const GUID_SEPARATOR_FOUR_INDEX = '00000000-0000-0000-0000'.length;
const ZERO_CODE = '0'.charCodeAt(FIRST_CHARACTER_INDEX);
const NINE_CODE = '9'.charCodeAt(FIRST_CHARACTER_INDEX);
const UPPERCASE_A_CODE = 'A'.charCodeAt(FIRST_CHARACTER_INDEX);
const UPPERCASE_F_CODE = 'F'.charCodeAt(FIRST_CHARACTER_INDEX);
const LOWERCASE_A_CODE = 'a'.charCodeAt(FIRST_CHARACTER_INDEX);
const LOWERCASE_F_CODE = 'f'.charCodeAt(FIRST_CHARACTER_INDEX);

function isHexCode(charCode: number): boolean {
  return (
    (charCode >= ZERO_CODE && charCode <= NINE_CODE) ||
    (charCode >= UPPERCASE_A_CODE && charCode <= UPPERCASE_F_CODE) ||
    (charCode >= LOWERCASE_A_CODE && charCode <= LOWERCASE_F_CODE)
  );
}

function isGuidString(key: string): boolean {
  if (key.length !== GUID_LENGTH) {
    return false;
  }

  if (
    key.charCodeAt(GUID_SEPARATOR_ONE_INDEX) !== GUID_SEPARATOR_CODE ||
    key.charCodeAt(GUID_SEPARATOR_TWO_INDEX) !== GUID_SEPARATOR_CODE ||
    key.charCodeAt(GUID_SEPARATOR_THREE_INDEX) !== GUID_SEPARATOR_CODE ||
    key.charCodeAt(GUID_SEPARATOR_FOUR_INDEX) !== GUID_SEPARATOR_CODE
  ) {
    return false;
  }

  for (let index = 0; index < key.length; index += 1) {
    const isSeparatorIndex =
      index === GUID_SEPARATOR_ONE_INDEX ||
      index === GUID_SEPARATOR_TWO_INDEX ||
      index === GUID_SEPARATOR_THREE_INDEX ||
      index === GUID_SEPARATOR_FOUR_INDEX;

    if (!isSeparatorIndex && !isHexCode(key.charCodeAt(index))) {
      return false;
    }
  }

  return true;
}

function shouldConvertKey(key: string, options?: KeysToCamelCaseOptions): boolean {
  if (isGuidString(key)) {
    return false;
  }

  return options?.shouldConvert?.(key) !== false;
}

export function keysToCamelCase<T>(
  obj: T,
  options?: KeysToCamelCaseOptions,
): KeysToCamelCase<T> {
  if (Array.isArray(obj)) {
    const array = obj as readonly unknown[];
    return array.map((value): unknown =>
      keysToCamelCase(value, options),
    ) as KeysToCamelCase<T>;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj as KeysToCamelCase<T>;
  }

  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = shouldConvertKey(key, options) ? toCamelCaseString(key) : key;
    result[camelKey] = keysToCamelCase(value, options);
  }
  return result as KeysToCamelCase<T>;
}
