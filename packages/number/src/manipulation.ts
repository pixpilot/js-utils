/**
 * Clamp a number between a minimum and maximum value.
 *
 * @param value - The number to clamp
 * @param minValue - The minimum value
 * @param maxValue - The maximum value
 * @returns The clamped number
 *
 * @example
 * ```typescript
 * clamp(5, 0, 10); // 5
 * clamp(-5, 0, 10); // 0
 * clamp(15, 0, 10); // 10
 * ```
 */
export function clamp(value: number, minValue: number, maxValue: number): number {
  return Math.min(Math.max(value, minValue), maxValue);
}

/**
 * Round a number to a specified number of decimal places.
 *
 * @param value - The number to round
 * @param decimals - The number of decimal places (default: 0)
 * @returns The rounded number
 *
 * @example
 * ```typescript
 * round(3.14159, 2); // 3.14
 * round(3.5); // 4
 * round(10.6789, 1); // 10.7
 * ```
 */
export function round(value: number, decimals = 0): number {
  const decimalBase = 10;
  const factor = decimalBase ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Generate a random integer between min and max (inclusive).
 *
 * @param minValue - The minimum value
 * @param maxValue - The maximum value
 * @returns A random integer between min and max
 *
 * @example
 * ```typescript
 * randomInt(1, 10); // Random number between 1 and 10
 * randomInt(0, 100); // Random number between 0 and 100
 * ```
 */
export function randomInt(minValue: number, maxValue: number): number {
  const minInt = Math.ceil(minValue);
  const maxInt = Math.floor(maxValue);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}

/**
 * Generate a random number between min and max (inclusive).
 *
 * @param minValue - The minimum value
 * @param maxValue - The maximum value
 * @returns A random number between min and max
 *
 * @example
 * ```typescript
 * random(0, 1); // Random number between 0 and 1
 * random(5.5, 10.5); // Random number between 5.5 and 10.5
 * ```
 */
export function random(minValue: number, maxValue: number): number {
  return Math.random() * (maxValue - minValue) + minValue;
}

/**
 * Calculate the sum of an array of numbers.
 *
 * @param numbers - The array of numbers
 * @returns The sum of the numbers
 *
 * @example
 * ```typescript
 * sum([1, 2, 3, 4, 5]); // 15
 * sum([]); // 0
 * ```
 */
export function sum(numbers: readonly number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

/**
 * Calculate the average of an array of numbers.
 *
 * @param numbers - The array of numbers
 * @returns The average of the numbers, or 0 if the array is empty
 *
 * @example
 * ```typescript
 * average([1, 2, 3, 4, 5]); // 3
 * average([10, 20, 30]); // 20
 * average([]); // 0
 * ```
 */
export function average(numbers: readonly number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  return sum(numbers) / numbers.length;
}

/**
 * Find the minimum value in an array of numbers.
 *
 * @param numbers - The array of numbers
 * @returns The minimum value, or Infinity if the array is empty
 *
 * @example
 * ```typescript
 * min([3, 1, 4, 1, 5]); // 1
 * min([10, -5, 20]); // -5
 * ```
 */
export function min(numbers: readonly number[]): number {
  return Math.min(...numbers);
}

/**
 * Find the maximum value in an array of numbers.
 *
 * @param numbers - The array of numbers
 * @returns The maximum value, or -Infinity if the array is empty
 *
 * @example
 * ```typescript
 * max([3, 1, 4, 1, 5]); // 5
 * max([10, -5, 20]); // 20
 * ```
 */
export function max(numbers: readonly number[]): number {
  return Math.max(...numbers);
}

/**
 * Check if a number is even.
 *
 * @param value - The number to check
 * @returns True if the number is even, false otherwise
 *
 * @example
 * ```typescript
 * isEven(4); // true
 * isEven(3); // false
 * isEven(0); // true
 * ```
 */
export function isEven(value: number): boolean {
  const divisor = 2;
  return value % divisor === 0;
}

/**
 * Check if a number is odd.
 *
 * @param value - The number to check
 * @returns True if the number is odd, false otherwise
 *
 * @example
 * ```typescript
 * isOdd(3); // true
 * isOdd(4); // false
 * isOdd(1); // true
 * ```
 */
export function isOdd(value: number): boolean {
  const divisor = 2;
  return value % divisor !== 0;
}

/**
 * Check if a number is positive.
 *
 * @param value - The number to check
 * @returns True if the number is positive, false otherwise
 *
 * @example
 * ```typescript
 * isPositive(5); // true
 * isPositive(-5); // false
 * isPositive(0); // false
 * ```
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Check if a number is negative.
 *
 * @param value - The number to check
 * @returns True if the number is negative, false otherwise
 *
 * @example
 * ```typescript
 * isNegative(-5); // true
 * isNegative(5); // false
 * isNegative(0); // false
 * ```
 */
export function isNegative(value: number): boolean {
  return value < 0;
}

/**
 * Check if a number is in a range (inclusive).
 *
 * @param value - The number to check
 * @param minValue - The minimum value
 * @param maxValue - The maximum value
 * @returns True if the number is in the range, false otherwise
 *
 * @example
 * ```typescript
 * inRange(5, 0, 10); // true
 * inRange(15, 0, 10); // false
 * inRange(0, 0, 10); // true
 * ```
 */
export function inRange(value: number, minValue: number, maxValue: number): boolean {
  return value >= minValue && value <= maxValue;
}

/**
 * Convert degrees to radians.
 *
 * @param degrees - The angle in degrees
 * @returns The angle in radians
 *
 * @example
 * ```typescript
 * toRadians(180); // Math.PI
 * toRadians(90); // Math.PI / 2
 * ```
 */
export function toRadians(degrees: number): number {
  const fullCircle = 180;
  return (degrees * Math.PI) / fullCircle;
}

/**
 * Convert radians to degrees.
 *
 * @param radians - The angle in radians
 * @returns The angle in degrees
 *
 * @example
 * ```typescript
 * toDegrees(Math.PI); // 180
 * toDegrees(Math.PI / 2); // 90
 * ```
 */
export function toDegrees(radians: number): number {
  const fullCircle = 180;
  return (radians * fullCircle) / Math.PI;
}

/**
 * Format a number with thousand separators.
 *
 * @param value - The number to format
 * @param separator - The separator to use (default: ',')
 * @returns The formatted number string
 *
 * @example
 * ```typescript
 * formatWithSeparator(1000000); // '1,000,000'
 * formatWithSeparator(1234.56); // '1,234.56'
 * formatWithSeparator(1000000, ' '); // '1 000 000'
 * ```
 */
export function formatWithSeparator(value: number, separator = ','): string {
  const parts = value.toString().split('.');
  parts[0] = parts[0]?.replace(/\B(?=(?:\d{3})+(?!\d))/gu, separator) ?? '';
  return parts.join('.');
}

/**
 * Parse a number from a string, returning null if invalid.
 *
 * @param value - The string to parse
 * @returns The parsed number or null if invalid
 *
 * @example
 * ```typescript
 * parseNumberOrNull('42'); // 42
 * parseNumberOrNull('3.14'); // 3.14
 * parseNumberOrNull('invalid'); // null
 * ```
 */
export function parseNumberOrNull(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
