const DEFAULT_RADIX = 36;

/**
 * Compute a fast, non-cryptographic 32-bit hash of a string.
 *
 * ⚠️ WARNING: Not cryptographically secure. Use only for cache keys, bucketing,
 * and other non-sensitive identifiers. For security, use `crypto.subtle.digest()` or bcrypt.
 *
 * @param str - The string to hash
 * @param radix - Base of the returned string, 2 to 36 (default: 36)
 * @returns The absolute hash value as a string in the given radix
 *
 * @example
 * ```typescript
 * simpleHash('hello'); // '1n1e4y'
 * simpleHash('hello', 16); // '5e918d2'
 * ```
 */
export function simpleHash(str: string, radix: number = DEFAULT_RADIX): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise, no-magic-numbers
    hash = (hash << 5) - hash + str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = hash & hash;
  }

  return `${Math.abs(hash).toString(radix)}`;
}
