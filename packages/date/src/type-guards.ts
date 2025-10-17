/**
 * Type guard to check if a value is a Date object.
 *
 * @param value - The value to check
 * @returns True if the value is a Date object, false otherwise
 *
 * @example
 * ```typescript
 * isDate(new Date()); // true
 * isDate('2023-01-01'); // false
 * isDate(null); // false
 * ```
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * Type guard to check if a value is a valid Date object (not Invalid Date).
 *
 * @param value - The value to check
 * @returns True if the value is a valid Date object, false otherwise
 *
 * @example
 * ```typescript
 * isValidDate(new Date()); // true
 * isValidDate(new Date('invalid')); // false
 * isValidDate('2023-01-01'); // false
 * ```
 */
export function isValidDate(value: unknown): value is Date {
  return isDate(value) && !Number.isNaN(value.getTime());
}
