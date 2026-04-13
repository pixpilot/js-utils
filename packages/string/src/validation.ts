/**
 * Check if a string is empty (zero length or only whitespace).
 *
 * @param str - The string to check
 * @param trimWhitespace - If true, treats whitespace-only strings as empty (default: true)
 * @returns True if the string is empty, false otherwise
 *
 * @example
 * isEmpty('');        // true
 * isEmpty('   ');     // true
 * isEmpty('hello');   // false
 */
export function isEmptyString(str: string, trimWhitespace = true): boolean {
  return trimWhitespace ? str.trim().length === 0 : str.length === 0;
}

/**
 * Like isEmptyString, but also returns true for null or undefined.
 * Use this when working with optional fields, API responses, or environment variables.
 *
 * @example
 * isEmptyStringOrNil(null);      // true
 * isEmptyStringOrNil(undefined); // true
 * isEmptyStringOrNil('   ');     // true
 * isEmptyStringOrNil('hello');   // false
 */
export function isEmptyStringOrNil(
  str: string | null | undefined,
  trimWhitespace = true,
): boolean {
  if (str == null) return true;
  return isEmptyString(str, trimWhitespace);
}

/**
 * Check if a string contains only alphanumeric characters.
 *
 * @param str - The string to check
 * @returns True if the string contains only alphanumeric characters, false otherwise
 *
 * @example
 * ```typescript
 * isAlphanumeric('abc123'); // true
 * isAlphanumeric('abc-123'); // false
 * isAlphanumeric(''); // false
 * ```
 */
export function isAlphanumeric(str: string): boolean {
  return /^[\da-z]+$/iu.test(str);
}

/**
 * Check if a string is a valid email address.
 *
 * @param str - The string to check
 * @returns True if the string is a valid email address, false otherwise
 *
 * @example
 * ```typescript
 * isEmail('test@example.com'); // true
 * isEmail('invalid-email'); // false
 * ```
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/u;
  return emailRegex.test(str);
}

/**
 * Check if a string is a valid URL.
 *
 * @param str - The string to check
 * @returns True if the string is a valid URL, false otherwise
 *
 * @example
 * ```typescript
 * isUrl('https://example.com'); // true
 * isUrl('not a url'); // false
 * ```
 */
export function isUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return Boolean(url);
  } catch {
    return false;
  }
}
