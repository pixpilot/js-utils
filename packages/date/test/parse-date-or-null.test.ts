import { describe, expect, it } from 'vitest';

import { parseDateOrNull } from '../src/parse-date-or-null';

describe('parseDateOrNull', () => {
  it('should parse a valid ISO date string', () => {
    const input = '2023-10-17T00:00:00.000Z';
    const result = parseDateOrNull(input);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe(input);
  });

  it('should parse a valid date string without time', () => {
    const input = '2023-10-17';
    const result = parseDateOrNull(input);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString().startsWith('2023-10-17')).toBe(true);
  });

  it('should return null for invalid date string', () => {
    const input = 'invalid-date';
    const result = parseDateOrNull(input);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const input = '';
    const result = parseDateOrNull(input);
    expect(result).toBeNull();
  });

  it('should return null for null input', () => {
    const input = null;
    const result = parseDateOrNull(input);
    expect(result).toBeNull();
  });

  it('should return null for undefined input', () => {
    const input = undefined;
    const result = parseDateOrNull(input);
    expect(result).toBeNull();
  });

  it('should return the same Date object if input is already a Date', () => {
    const input = new Date('2023-10-17');
    const result = parseDateOrNull(input);
    expect(result).toBe(input);
  });

  it('should return null for invalid Date object', () => {
    const input = new Date('invalid');
    const result = parseDateOrNull(input);
    expect(result).toBeNull();
  });
});
