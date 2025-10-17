/**
 * Type guard to check if a value is a number (excluding NaN).
 *
 * @param value - The value to check
 * @returns True if the value is a valid number, false otherwise
 *
 * @example
 * ```typescript
 * isNumber(42); // true
 * isNumber(3.14); // true
 * isNumber(NaN); // false
 * isNumber('42'); // false
 * ```
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard to check if a value is an integer.
 *
 * @param value - The value to check
 * @returns True if the value is an integer, false otherwise
 *
 * @example
 * ```typescript
 * isInteger(42); // true
 * isInteger(3.14); // false
 * isInteger(NaN); // false
 * ```
 */
export function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

/**
 * Type guard to check if a value is a finite number.
 *
 * @param value - The value to check
 * @returns True if the value is a finite number, false otherwise
 *
 * @example
 * ```typescript
 * isFinite(42); // true
 * isFinite(Infinity); // false
 * isFinite(NaN); // false
 * ```
 */
export function isFiniteNumber(value: unknown): value is number {
  return Number.isFinite(value);
}

/**
 * Type guard to check if a value is a safe integer.
 *
 * @param value - The value to check
 * @returns True if the value is a safe integer, false otherwise
 *
 * @example
 * ```typescript
 * isSafeInteger(42); // true
 * isSafeInteger(Number.MAX_SAFE_INTEGER); // true
 * isSafeInteger(Number.MAX_SAFE_INTEGER + 1); // false
 * ```
 */
export function isSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value);
}
