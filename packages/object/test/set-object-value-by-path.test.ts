import { describe, expect, it } from 'vitest';
import { setObjectValueByPath } from '../src/set-object-value-by-path';

describe('setObjectValueByPath', () => {
  it('should set nested values', () => {
    const obj = { a: { b: {} } };
    setObjectValueByPath(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  it('should create missing paths', () => {
    const obj = {};
    setObjectValueByPath(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  it('should handle empty path', () => {
    const obj = { a: 1 };
    setObjectValueByPath(obj, '', 42);
    expect(obj).toEqual({ a: 1, '': 42 });
  });

  it('should handle null object', () => {
    const obj = null as any;
    setObjectValueByPath(obj, 'a', 42);
    expect(obj).toBe(null);
  });

  it('should handle undefined object', () => {
    const obj = undefined as any;
    setObjectValueByPath(obj, 'a', 42);
    expect(obj).toBeUndefined();
  });

  it('should handle primitive values', () => {
    const obj = 42 as any;
    setObjectValueByPath(obj, 'a', 1);
    expect(obj).toBe(42);
  });

  it('should handle array paths', () => {
    const obj = { a: [] };
    setObjectValueByPath(obj, 'a.0.b', 42);
    expect(obj).toEqual({ a: [{ b: 42 }] });
  });

  it('should handle deep nesting', () => {
    const obj = {};
    setObjectValueByPath(obj, 'a.b.c.d.e', 42);
    expect(obj).toEqual({ a: { b: { c: { d: { e: 42 } } } } });
  });

  it('should handle paths with special characters', () => {
    const obj = {};
    setObjectValueByPath(obj, ['a.b', 'c'], 42);
    expect(obj).toEqual({ 'a.b': { c: 42 } });
  });

  it('should handle array as path', () => {
    const obj = {};
    setObjectValueByPath(obj, ['a', 'b', 'c'], 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  it('should handle empty segments in path', () => {
    const obj = {};
    setObjectValueByPath(obj, 'a..b', 42);
    expect(obj).toEqual({ a: { '': { b: 42 } } });
  });

  it('should delete when value is undefined and deleteUndefined is true', () => {
    const obj = { a: { b: { c: 1 } } };
    setObjectValueByPath(obj, 'a.b.c', undefined, { deleteUndefine: true });
    expect(obj).toEqual({ a: { b: {} } });
  });

  it('should not delete when value is undefined and deleteUndefined is false', () => {
    const obj = { a: { b: { c: 1 } } };
    setObjectValueByPath(obj, 'a.b.c', undefined, { deleteUndefine: false });
    expect(obj).toEqual({ a: { b: { c: undefined } } });
  });

  it('should not delete when value is undefined and deleteUndefined is default', () => {
    const obj = { a: { b: { c: 1 } } };
    setObjectValueByPath(obj, 'a.b.c', undefined);
    expect(obj).toEqual({ a: { b: { c: undefined } } });
  });
});
