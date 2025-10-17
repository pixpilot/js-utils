import deepmerge from '@fastify/deepmerge';
import { isObject } from './type-guards';

// Create a deepmerge instance with default options
const deepMerge = deepmerge();

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
 * Deep merge two objects.
 *
 * Uses @fastify/deepmerge for efficient and reliable deep merging.
 *
 * @param target - The target object
 * @param source - The source object to merge into the target
 * @returns A new merged object
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * merge(obj1, obj2); // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function merge<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(target: T, source: U): T & U {
  return deepMerge(target, source) as T & U;
}

/**
 * Deep merge multiple objects.
 *
 * Uses @fastify/deepmerge to merge any number of objects into a single result.
 * Objects are merged from left to right, with later objects overriding earlier ones.
 *
 * @param objects - The objects to merge
 * @returns A new merged object
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * const obj3 = { e: 5, f: 6 };
 * mergeAll(obj1, obj2, obj3); // { a: 1, b: { c: 2, d: 3 }, e: 5, f: 6 }
 * ```
 */
export function mergeAll<T extends Record<string, unknown>>(
  ...objects: T[]
): Record<string, unknown> {
  if (objects.length === 0) {
    return {};
  }
  if (objects.length === 1) {
    return objects[0] ?? {};
  }
  // Merge all objects sequentially
  let result: Record<string, unknown> = {};
  for (const obj of objects) {
    result = deepMerge(result, obj);
  }
  return result;
}

/**
 * Re-export the configured deepmerge instance from @fastify/deepmerge.
 *
 * This provides direct access to the deepmerge function for advanced use cases,
 * allowing merging of multiple objects and custom options.
 *
 * @example
 * ```typescript
 * import { deepmerge } from '@pixpilot/object';
 * const result = deepmerge({ a: 1 }, { b: 2 }, { c: 3 });
 * // { a: 1, b: 2, c: 3 }
 * ```
 */
export { deepMerge as deepmerge };

/**
 * Get a nested value from an object using a path string.
 *
 * @param obj - The source object
 * @param path - The path to the value (e.g., 'a.b.c')
 * @param defaultValue - The default value to return if the path doesn't exist
 * @returns The value at the path or the default value
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 } } };
 * get(obj, 'a.b.c'); // 42
 * get(obj, 'a.b.x', 'default'); // 'default'
 * ```
 */
export function get<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T,
): T | undefined {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (
      result !== null &&
      result !== undefined &&
      typeof result === 'object' &&
      key in result
    ) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return defaultValue;
    }
  }

  return result as T;
}

/**
 * Set a nested value in an object using a path string.
 *
 * @param obj - The target object
 * @param path - The path to set the value at (e.g., 'a.b.c')
 * @param value - The value to set
 * @returns The modified object
 *
 * @example
 * ```typescript
 * const obj = { a: { b: {} } };
 * set(obj, 'a.b.c', 42); // { a: { b: { c: 42 } } }
 * ```
 */
export function set<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (lastKey == null || lastKey.length === 0) {
    return obj;
  }

  let current: Record<string, unknown> = obj;

  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
  return obj;
}

/**
 * Check if an object has a nested property using a path string.
 *
 * @param obj - The source object
 * @param path - The path to check (e.g., 'a.b.c')
 * @returns True if the path exists, false otherwise
 *
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 } } };
 * has(obj, 'a.b.c'); // true
 * has(obj, 'a.b.x'); // false
 * ```
 */
export function has(obj: Record<string, unknown>, path: string): boolean {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current !== null &&
      current !== undefined &&
      typeof current === 'object' &&
      key in current
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Get all keys of an object including nested keys.
 *
 * @param obj - The source object
 * @param prefix - The prefix to prepend to keys (used internally for recursion)
 * @returns An array of all keys including nested paths
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
 * flatKeys(obj); // ['a', 'b.c', 'b.d.e']
 * ```
 */
export function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isObject(value)) {
      keys.push(...flatKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
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
