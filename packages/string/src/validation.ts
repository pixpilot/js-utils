/**
 * Check if a string is empty (zero length or only whitespace).
 *
 * @param str - The string to check
 * @param trimWhitespace - If true, treats whitespace-only strings as empty (default: true)
 * @returns True if the string is empty, false otherwise
 *
 * @example
 * ```typescript
 * isEmpty(''); // true
 * isEmpty('   '); // true
 * isEmpty('   ', false); // false
 * isEmpty('hello'); // false
 * ```
 */
export function isEmpty(str: string, trimWhitespace = true): boolean {
  if (trimWhitespace) {
    return str.trim().length === 0;
  }
  return str.length === 0;
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
