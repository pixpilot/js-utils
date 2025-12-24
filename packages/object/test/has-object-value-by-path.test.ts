import { describe, expect, it } from 'vitest';
import { hasObjectValueByPath } from '../src/has-object-value-by-path';

describe('hasObjectValueByPath', () => {
  it('should check if paths exist', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(hasObjectValueByPath(obj, 'a.b.c')).toBe(true);
    expect(hasObjectValueByPath(obj, 'a.b.x')).toBe(false);
  });

  it('should handle empty path', () => {
    const obj = { a: 1 };
    expect(hasObjectValueByPath(obj, '')).toBe(false);
  });

  it('should handle null object', () => {
    expect(hasObjectValueByPath(null as any, 'a')).toBe(false);
  });

  it('should handle undefined object', () => {
    expect(hasObjectValueByPath(undefined, 'a')).toBe(false);
  });

  it('should handle primitive values', () => {
    expect(hasObjectValueByPath(42 as any, 'a')).toBe(false);
    expect(hasObjectValueByPath('string' as any, 'a')).toBe(false);
  });

  it('should handle array paths', () => {
    const obj = { a: [{ b: 1 }, { b: 2 }] };
    expect(hasObjectValueByPath(obj, 'a.0.b')).toBe(true);
    expect(hasObjectValueByPath(obj, 'a.2.b')).toBe(false);
  });

  it('should handle deep nesting', () => {
    const obj = { a: { b: { c: { d: { e: 42 } } } } };
    expect(hasObjectValueByPath(obj, 'a.b.c.d.e')).toBe(true);
    expect(hasObjectValueByPath(obj, 'a.b.c.d.f')).toBe(false);
  });

  it('should handle paths with special characters', () => {
    const obj = { 'a.b': { c: 42 } };
    expect(hasObjectValueByPath(obj, ['a.b', 'c'])).toBe(true);
  });

  it('should handle array as path', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(hasObjectValueByPath(obj, ['a', 'b', 'c'])).toBe(true);
    expect(hasObjectValueByPath(obj, ['a', 'b', 'd'])).toBe(false);
  });

  it('should handle empty segments in path', () => {
    const obj = { a: { b: 42 } };
    expect(hasObjectValueByPath(obj, 'a..b')).toBe(false);
  });
});
