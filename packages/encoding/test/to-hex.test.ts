import { describe, expect, it } from 'vitest';

import { toHex } from '../src';

describe('toHex', () => {
  it('should encode bytes as lowercase hex with leading zeroes', () => {
    const input = new Uint8Array([0x00, 0x01, 0x0f, 0x10, 0xab, 0xff]).buffer;

    expect(toHex(input)).toBe('00010f10abff');
  });

  it('should return an empty string for an empty ArrayBuffer', () => {
    expect(toHex(new ArrayBuffer(0))).toBe('');
  });
});
