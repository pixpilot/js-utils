import { describe, expect, it } from 'vitest';
import { countOccurrences } from '../src/manipulation';
import { isAlphanumeric, isEmail, isEmpty, isUrl } from '../src/validation';

describe('isEmpty', () => {
  it('should return true for empty strings', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty(' a ')).toBe(false);
  });

  it('should respect trimWhitespace parameter', () => {
    expect(isEmpty('   ', false)).toBe(false);
    expect(isEmpty('', false)).toBe(true);
  });
});

describe('isAlphanumeric', () => {
  it('should return true for alphanumeric strings', () => {
    expect(isAlphanumeric('abc123')).toBe(true);
    expect(isAlphanumeric('ABC')).toBe(true);
    expect(isAlphanumeric('123')).toBe(true);
  });

  it('should return false for non-alphanumeric strings', () => {
    expect(isAlphanumeric('abc-123')).toBe(false);
    expect(isAlphanumeric('hello world')).toBe(false);
    expect(isAlphanumeric('')).toBe(false);
    expect(isAlphanumeric('abc_123')).toBe(false);
  });
});

describe('isEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('user.name@domain.co.uk')).toBe(true);
    expect(isEmail('test+tag@example.com')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(isEmail('invalid-email')).toBe(false);
    expect(isEmail('@example.com')).toBe(false);
    expect(isEmail('test@')).toBe(false);
    expect(isEmail('test')).toBe(false);
  });
});

describe('isUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://example.com')).toBe(true);
    expect(isUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isUrl('not a url')).toBe(false);
    expect(isUrl('example.com')).toBe(false);
    expect(isUrl('')).toBe(false);
  });
});

describe('countOccurrences', () => {
  it('should count occurrences case-sensitively', () => {
    expect(countOccurrences('hello world hello', 'hello')).toBe(2);
    expect(countOccurrences('Hello HELLO hello', 'hello')).toBe(1);
  });

  it('should count occurrences case-insensitively', () => {
    expect(countOccurrences('Hello HELLO hello', 'hello', false)).toBe(3);
  });

  it('should return 0 for empty search value', () => {
    expect(countOccurrences('hello', '')).toBe(0);
  });
});
