import { sha256Hex } from '../src';

describe('sha256Hex', () => {
  it('should produce the known SHA-256 digest of a string', async () => {
    await expect(sha256Hex('hello world')).resolves.toBe(
      'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    );
  });

  it('should produce the known digest of an empty string', async () => {
    await expect(sha256Hex('')).resolves.toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('should hash raw ArrayBuffer bytes', async () => {
    const input = new Uint8Array([0x61, 0x62, 0x63]).buffer;

    await expect(sha256Hex(input)).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('should hash an empty ArrayBuffer consistently with an empty string', async () => {
    await expect(sha256Hex(new ArrayBuffer(0))).resolves.toBe(await sha256Hex(''));
  });

  it('should encode Unicode strings as UTF-8', async () => {
    const utf8Bytes = new Uint8Array([0xc3, 0xa9, 0xf0, 0x9f, 0x98, 0x8a]).buffer;

    await expect(sha256Hex('é😊')).resolves.toBe(await sha256Hex(utf8Bytes));
  });
});
