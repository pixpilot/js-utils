const HEX_RADIX = 16;
const HEX_BYTE_LENGTH = 2;

/** Hex-encodes raw bytes as a lowercase hexadecimal string. */
export function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(HEX_RADIX).padStart(HEX_BYTE_LENGTH, '0'))
    .join('');
}
