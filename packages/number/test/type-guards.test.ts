import { describe, expect, it } from 'vitest';
import { isFiniteNumber, isInteger, isNumber, isSafeInteger } from '../src/type-guards';

describe('isNumber', () => {
  it('should return true for valid numbers', () => {
    expect(isNumber(42)).toBe(true);
    expect(isNumber(3.14)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-5)).toBe(true);
  });

  it('should return false for NaN and non-numbers', () => {
    expect(isNumber(Number.NaN)).toBe(false);
    expect(isNumber('42')).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
  });
});

describe('isInteger', () => {
  it('should return true for integers', () => {
    expect(isInteger(42)).toBe(true);
    expect(isInteger(0)).toBe(true);
    expect(isInteger(-5)).toBe(true);
  });

  it('should return false for non-integers', () => {
    expect(isInteger(3.14)).toBe(false);
    expect(isInteger(Number.NaN)).toBe(false);
  });
});

describe('isFiniteNumber', () => {
  it('should return true for finite numbers', () => {
    expect(isFiniteNumber(42)).toBe(true);
    expect(isFiniteNumber(-3.14)).toBe(true);
  });

  it('should return false for infinite numbers', () => {
    expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isFiniteNumber(Number.NEGATIVE_INFINITY)).toBe(false);
    expect(isFiniteNumber(Number.NaN)).toBe(false);
  });
});

describe('isSafeInteger', () => {
  it('should return true for safe integers', () => {
    expect(isSafeInteger(42)).toBe(true);
    expect(isSafeInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  it('should return false for unsafe integers', () => {
    expect(isSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(isSafeInteger(3.14)).toBe(false);
  });
});
