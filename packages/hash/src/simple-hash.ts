const DEFAULT_RADIX = 36;

// ⚠️ WARNING: Not cryptographically secure. Use only for:
// - Cache keys, bucketing, non-sensitive identifiers
// For security: use crypto.subtle.digest() or bcrypt
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
