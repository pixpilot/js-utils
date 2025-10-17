import { describe, expect, it } from 'vitest';
import { isDate, isValidDate } from '../src/type-guards';

describe('isDate', () => {
  it('should return true for Date objects', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('2023-01-01'))).toBe(true);
  });

  it('should return false for non-Date objects', () => {
    expect(isDate('2023-01-01')).toBe(false);
    expect(isDate(null)).toBe(false);
    expect(isDate(undefined)).toBe(false);
    expect(isDate(123)).toBe(false);
  });
});

describe('isValidDate', () => {
  it('should return true for valid dates', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('2023-01-01'))).toBe(true);
  });

  it('should return false for invalid dates', () => {
    expect(isValidDate(new Date('invalid'))).toBe(false);
    expect(isValidDate('2023-01-01')).toBe(false);
  });
});
