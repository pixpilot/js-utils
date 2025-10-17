/**
 * Type guard to check if a value is an object (and not null or an array).
 *
 * @param value - The value to check
 * @returns True if the value is an object, false otherwise
 *
 * @example
 * ```typescript
 * isObject({}); // true
 * isObject({ key: 'value' }); // true
 * isObject([]); // false
 * isObject(null); // false
 * isObject('string'); // false
 * ```
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a plain object
 * (created with {} or new Object(), not a class instance).
 *
 * @param value - The value to check
 * @returns True if the value is a plain object, false otherwise
 *
 * @example
 * ```typescript
 * isPlainObject({}); // true
 * isPlainObject({ key: 'value' }); // true
 * isPlainObject(new Date()); // false
 * isPlainObject([]); // false
 * ```
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) {
    return false;
  }

  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === null || proto === Object.prototype;
}

/**
 * Type guard to check if a value is an empty object.
 *
 * @param value - The value to check
 * @returns True if the value is an empty object, false otherwise
 *
 * @example
 * ```typescript
 * isEmptyObject({}); // true
 * isEmptyObject({ key: 'value' }); // false
 * isEmptyObject([]); // false
 * ```
 */
export function isEmptyObject(value: unknown): boolean {
  return isObject(value) && Object.keys(value).length === 0;
}
