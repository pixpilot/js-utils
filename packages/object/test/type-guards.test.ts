import { describe, expect, it } from 'vitest';
import { isEmptyObject, isObject, isPlainObject } from '../src/type-guards';

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: 'value' })).toBe(true);
    expect(isObject(new Date())).toBe(true);
  });

  it('should return false for non-objects', () => {
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});

describe('isPlainObject', () => {
  it('should return true for plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ key: 'value' })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  it('should return false for non-plain objects', () => {
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
  });
});

describe('isEmptyObject', () => {
  it('should return true for empty objects', () => {
    expect(isEmptyObject({})).toBe(true);
  });

  it('should return false for non-empty objects', () => {
    expect(isEmptyObject({ key: 'value' })).toBe(false);
    expect(isEmptyObject([])).toBe(false);
  });
});
