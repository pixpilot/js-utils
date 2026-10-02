import { toHex } from '@pixpilot/encoding';

/**
 * Computes a lowercase hex SHA-256 digest using Web Crypto.
 * Strings are UTF-8 encoded; ArrayBuffers are hashed as-is.
 */
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}
