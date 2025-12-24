import {
  deepKeys,
  deleteProperty,
  escapePath,
  getProperty,
  hasProperty,
  parsePath,
  setProperty,
  stringifyPath,
  unflatten,
} from 'dot-prop';

/**
 * Pick specific keys from an object.
 *
 * @param obj - The source object
 * @param keys - The keys to pick
 * @returns A new object with only the specified keys
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * pick(obj, ['a', 'c']); // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Omit specific keys from an object.
 *
 * @param obj - The source object
 * @param keys - The keys to omit
 * @returns A new object without the specified keys
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * omit(obj, ['b']); // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<T, K>;
}

/**
 * Deep clone an object.
 *
 * @param obj - The object to clone
 * @returns A deep clone of the object
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(obj);
 * cloned.b.c = 3;
 * console.log(obj.b.c); // 2 (original unchanged)
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: unknown) => deepClone(item)) as T;
  }

  const cloned = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    cloned[key] = deepClone(value);
  }

  return cloned as T;
}

/**
 * Compare two objects for deep equality.
 *
 * @param obj1 - The first object
 * @param obj2 - The second object
 * @returns True if the objects are deeply equal, false otherwise
 *
 * @example
 * ```typescript
 * deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }); // true
 * deepEqual({ a: 1 }, { a: 2 }); // false
 * ```
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (obj1 === null || obj2 === null) {
    return false;
  }

  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    return keys1.every((key) =>
      deepEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key],
      ),
    );
  }

  return false;
}

/**
 * Map over the values of an object.
 *
 * @param obj - The source object
 * @param fn - The mapping function
 * @returns A new object with mapped values
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * mapValues(obj, (value) => value * 2); // { a: 2, b: 4, c: 6 }
 * ```
 */
export function mapValues<T extends Record<string, unknown>, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U,
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;

  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = fn(value as T[keyof T], key as keyof T);
  }

  return result;
}

/**
 * Map over the keys of an object.
 *
 * @param obj - The source object
 * @param fn - The mapping function
 * @returns A new object with mapped keys
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2 };
 * mapKeys(obj, (key) => key.toUpperCase()); // { A: 1, B: 2 }
 * ```
 */
export function mapKeys<T extends Record<string, unknown>>(
  obj: T,
  fn: (key: keyof T) => string,
): Record<string, T[keyof T]> {
  const result = {} as Record<string, T[keyof T]>;

  for (const [key, value] of Object.entries(obj)) {
    const newKey = fn(key as keyof T);
    result[newKey] = value as T[keyof T];
  }

  return result;
}

export const flatKeys = deepKeys;

export {
  deleteProperty,
  escapePath,
  getProperty,
  hasProperty,
  parsePath,
  setProperty,
  stringifyPath,
  unflatten,
};
