import { DEFAULT_RADIX, simpleHash } from '../src/simple-hash';

describe('simpleHash', () => {
  // --- Test 1: Core Functionality and Consistency ---

  describe('core Functionality', () => {
    it('should produce a correct and consistent hash for a known string', () => {
      // This is a "snapshot" test. If the algorithm changes, this will fail.
      const input = 'hello';
      const expectedHash = '1n1e4y';
      expect(simpleHash(input)).toBe(expectedHash);
    });

    it('should produce the same hash for the same input when called multiple times', () => {
      const input = 'consistent-string';
      const hash1 = simpleHash(input);
      const hash2 = simpleHash(input);
      expect(hash1).toBe(hash2);
    });

    it('should produce a known hash for a string with numbers', () => {
      const input = 'user-id-12345';
      const expectedHash = 'pxrzul';
      expect(simpleHash(input)).toBe(expectedHash);
    });

    it('should use DEFAULT_RADIX of 36', () => {
      expect(DEFAULT_RADIX).toBe(36);
    });
  });

  // --- Test 2: Input Sensitivity ---

  describe('input Sensitivity', () => {
    it('should produce different hashes for different inputs', () => {
      const hash1 = simpleHash('abc');
      const hash2 = simpleHash('def');
      expect(hash1).not.toBe(hash2);
    });

    it('should be case-sensitive', () => {
      const hash1 = simpleHash('TestCase');
      const hash2 = simpleHash('testcase');
      expect(hash1).not.toBe(hash2);
    });

    it('should be sensitive to minor changes', () => {
      const hash1 = simpleHash('hello world');
      const hash2 = simpleHash('hello world!'); // Added "!"
      expect(hash1).not.toBe(hash2);
    });

    it('should be sensitive to whitespace changes', () => {
      const hash1 = simpleHash('hello');
      const hash2 = simpleHash(' hello'); // Added space
      expect(hash1).not.toBe(hash2);
    });
  });

  // --- Test 3: Edge Cases ---

  describe('edge Cases', () => {
    it('should handle unicode characters including emojis', () => {
      const input1 = '你好';
      const input2 = 'emoji_😊';
      const input3 = '👩‍🚀👨‍👩‍👧‍👦🏳️‍🌈';

      const hash1 = simpleHash(input1);
      const hash2 = simpleHash(input2);
      const hash3 = simpleHash(input3);

      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash3).toBeDefined();
      expect(hash1).toMatch(/^[a-z0-9]+$/u);
      expect(hash2).toMatch(/^[a-z0-9]+$/u);
      expect(hash3).toMatch(/^[a-z0-9]+$/u);
      expect(hash1).toBe('dzq5');
      expect(hash2).toBe('j9cjra');
      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
    });

    it('should handle extremely large strings without throwing', () => {
      const largeString = 'xyz'.repeat(10_000_000);
      expect(() => simpleHash(largeString)).not.toThrow();
    });

    it('should handle strings with null characters and control codes', () => {
      const input = 'abc\u0000def\u0001ghi';
      const hash = simpleHash(input);
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-z0-9]+$/u);
    });

    it('should handle strings with only whitespace', () => {
      const input = '     ';
      const hash = simpleHash(input);
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-z0-9]+$/u);
    });

    it('should produce a valid hash for multiline strings', () => {
      const input = 'line1\nline2\nline3';
      const hash = simpleHash(input);
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-z0-9]+$/u);
    });

    it('should handle a string with extremely high char codes (unicode edge)', () => {
      const input = String.fromCharCode(0x10ffff); // max Unicode code point
      const hash = simpleHash(input);
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-z0-9]+$/u);
    });

    it('should produce consistent output when radix changes', () => {
      const input = 'radix-test';
      const hashBase10 = simpleHash(input, 10);
      const hashBase36 = simpleHash(input, 36);
      const hashBase16 = simpleHash(input, 16);

      expect(hashBase10).not.toBe(hashBase36);
      expect(hashBase16).not.toBe(hashBase36);
      expect(hashBase10).toMatch(/^\d+$/u);
    });

    it('should throw with invalid radix values', () => {
      const input = 'invalid-radix';
      expect(() => simpleHash(input, 1)).toThrow(); // radix < 2 invalid
      expect(() => simpleHash(input, 37)).toThrow(); // radix > 36 invalid
    });

    it('should handle an empty string', () => {
      // The loop doesn't run, hash remains 0.
      // Math.abs(0).toString(36) is "0".
      expect(simpleHash('')).toBe('0');
    });

    it('should handle a single character string', () => {
      // 'a'.charCodeAt(0) is 97.
      // Math.abs(97).toString(36) is "2p".
      expect(simpleHash('a')).toBe('2p');
    });

    it('should handle strings with numbers and special characters', () => {
      const input = '123!@#$%^&*()_+-={}[]|\\:;"\'<>,.?/~`';
      const expectedHash = 'wp5q8k';
      const hash = simpleHash(input);
      expect(hash).toBe(expectedHash);
    });

    it('should handle repeated characters differently', () => {
      const hash1 = simpleHash('a');
      const hash2 = simpleHash('aa');
      const hash3 = simpleHash('aaa');

      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
    });

    it('should handle newlines and carriage returns', () => {
      const hash1 = simpleHash('line1\nline2');
      const hash2 = simpleHash('line1\r\nline2');
      const hash3 = simpleHash('line1line2');

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });
  });

  // --- Test 4: Output Formatting ---

  describe('output Formatting', () => {
    it('should only contain base-36 characters (a-z, 0-9)', () => {
      const hash = simpleHash('a-very-complex-string-with-!@#-$%^');
      expect(hash).toMatch(/^[a-z0-9]+$/u);
    });

    it('should correctly handle a hash value of 0 from an empty string', () => {
      const hash = simpleHash('');
      expect(hash).toBe('0');
    });

    it('should not contain a negative sign in the final output', () => {
      // This string is known to produce a negative hash before Math.abs()
      const input = 'trigger_negative';
      const hash = simpleHash(input);

      // The expected hash is "m55ick"
      // If Math.abs() wasn't there, it might be "-m55ick"
      expect(hash).toBe('m55ick');
      expect(hash.includes('-')).toBe(false);
    });
  });
});

describe('custom Radix', () => {
  it('should accept custom radix parameter', () => {
    const input = 'test';
    const hash36 = simpleHash(input, 36);
    const hash16 = simpleHash(input, 16);
    const hash10 = simpleHash(input, 10);

    expect(hash36).not.toBe(hash16);
    expect(hash16).not.toBe(hash10);
  });

  it('should produce hexadecimal output with radix 16', () => {
    const hash = simpleHash('hextest', 16);
    expect(hash).toMatch(/^[0-9a-f]+$/u);
  });

  it('should produce decimal output with radix 10', () => {
    const hash = simpleHash('dectest', 10);
    expect(hash).toMatch(/^\d+$/u);
  });

  it('should produce binary output with radix 2', () => {
    const hash = simpleHash('bintest', 2);
    expect(hash).toMatch(/^[01]+$/u);
  });

  it('should produce shorter hashes with higher radix', () => {
    const input = 'length-comparison';
    const hash10 = simpleHash(input, 10);
    const hash36 = simpleHash(input, 36);

    expect(hash36.length).toBeLessThan(hash10.length);
  });
});
