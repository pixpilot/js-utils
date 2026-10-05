import { toHex } from '@pixpilot/encoding';

/**
 * Computes a lowercase hex SHA-256 digest using Web Crypto.
 * Strings are UTF-8 encoded; ArrayBuffers are hashed as-is.
 *
 * @example
 * await sha256Hex('abc'); // 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
 */
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}
