import { describe, expect, it } from 'vitest';
import { getObjectValueByPath } from '../src/get-object-value-by-path';

describe('getObjectValueByPath', () => {
  it('should get nested values', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getObjectValueByPath(obj, 'a.b.c')).toBe(42);
  });

  it('should return undefined for missing paths', () => {
    const obj = { a: { b: {} } };
    expect(getObjectValueByPath(obj, 'a.b.x')).toBeUndefined();
  });

  it('should handle empty path', () => {
    const obj = { a: 1 };
    expect(getObjectValueByPath(obj, '')).toBeUndefined();
  });

  it('should handle null object', () => {
    expect(getObjectValueByPath(null as any, 'a')).toBe(null);
  });

  it('should handle undefined object', () => {
    expect(getObjectValueByPath(undefined as any, 'a')).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(getObjectValueByPath(42 as any, 'a')).toBe(42);
    expect(getObjectValueByPath('string' as any, 'a')).toBe('string');
  });

  it('should handle array paths', () => {
    const obj = { a: [{ b: 1 }, { b: 2 }] };
    expect(getObjectValueByPath(obj, 'a.0.b')).toBe(1);
    expect(getObjectValueByPath(obj, 'a.1.b')).toBe(2);
  });

  it('should handle deep nesting', () => {
    const obj = { a: { b: { c: { d: { e: 42 } } } } };
    expect(getObjectValueByPath(obj, 'a.b.c.d.e')).toBe(42);
  });

  it('should handle paths with special characters', () => {
    const obj = { 'a.b': { c: 42 } };
    expect(getObjectValueByPath(obj, ['a.b', 'c'])).toBe(42);
  });

  it('should handle array as path', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getObjectValueByPath(obj, ['a', 'b', 'c'])).toBe(42);
  });

  it('should handle empty segments in path', () => {
    const obj = { a: { b: 42 } };
    expect(getObjectValueByPath(obj, 'a..b')).toBeUndefined();
  });
});
