/**
 * Type guard to check if a value is a string.
 *
 * @param value - The value to check
 * @returns True if the value is a string, false otherwise
 *
 * @example
 * ```typescript
 * isString('hello'); // true
 * isString(123); // false
 * isString(null); // false
 * ```
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
