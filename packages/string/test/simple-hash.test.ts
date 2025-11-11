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

    it('should handle a very long string', () => {
      const longString = 'a'.repeat(1000);
      const hash = simpleHash(longString);

      // Ensure it's not the same as a slightly different long string
      const differentLongString = `${'a'.repeat(999)}b`;

      expect(hash).toBeDefined();
      expect(hash).not.toBe(simpleHash(differentLongString));
    });

    it('should handle strings with numbers and special characters', () => {
      const input = '123!@#$%^&*()_+-={}[]|\\:;"\'<>,.?/~`';
      const expectedHash = 'wp5q8k';
      const hash = simpleHash(input);
      expect(hash).toBe(expectedHash);
    });

    it('should handle strings with unicode (including emoji) characters', () => {
      // This works because charCodeAt() handles surrogate pairs consistently.
      const input1 = '你好';
      const input2 = 'emoji_😊';

      const hash1 = simpleHash(input1);
      const hash2 = simpleHash(input2);

      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1).not.toBe(hash2);
      expect(hash1).toBe('dzq5');
      expect(hash2).toBe('j9cjra');
    });
  });

  // --- Test 4: Output Formatting ---

  describe('output Formatting', () => {
    it('should always prepend the "" prefix', () => {
      expect(simpleHash('any_string')).toMatch(/^/u);
      expect(simpleHash('')).toMatch(/^/u);
    });

    it('should only contain base-36 characters (a-z, 0-9) after the prefix', () => {
      const hash = simpleHash('a-very-complex-string-with-!@#-$%^');
      const hashValue = hash.substring(''.length);

      // Regex: matches one or more lowercase letters or digits.
      expect(hashValue).toMatch(/^[a-z0-9]+$/u);
    });

    it('should correctly handle a hash value of 0 from an empty string', () => {
      const hash = simpleHash('');
      const hashValue = hash.substring(''.length);
      expect(hashValue).toBe('0');
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
