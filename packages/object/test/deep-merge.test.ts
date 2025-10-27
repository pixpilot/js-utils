import { describe, expect, it } from 'vitest';
import { deepMerge, deepMergeMany } from '../src/deep-merge';

describe('merge', () => {
  it('should deep merge objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
  });

  it('should handle symbols as keys', () => {
    const sym = Symbol('test');
    const obj1 = { [sym]: 1, a: 2 };
    const obj2 = { [sym]: 3, b: 4 };
    const result = deepMerge(obj1 as any, obj2 as any);
    expect(result[sym]).toBeUndefined();
    expect(result.a).toBe(2);
    expect(result.b).toBe(4);
  });

  it('should handle null values', () => {
    const obj1 = { a: 1, b: null };
    const obj2 = { b: { c: 2 }, d: null };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: { c: 2 }, d: null });
  });

  it('should handle undefined values', () => {
    const obj1 = { a: 1, b: undefined };
    const obj2 = { b: { c: 2 }, d: undefined };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: { c: 2 }, d: undefined });
  });

  it('should concatenate arrays', () => {
    const obj1 = { a: [1, 2] };
    const obj2 = { a: [3, 4] };
    expect(deepMerge(obj1, obj2)).toEqual({ a: [1, 2, 3, 4] });
  });

  it('should handle functions', () => {
    const fn1 = () => 1;
    const fn2 = () => 2;
    const obj1 = { a: fn1 };
    const obj2 = { a: fn2 };
    const result = deepMerge(obj1, obj2);
    expect(result.a).toBe(fn2);
  });

  it('should handle primitive values', () => {
    const obj1 = { a: 'string' };
    const obj2 = { a: 42 };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 42 });
  });

  it('should handle Date objects', () => {
    const date1 = new Date('2020-01-01');
    const date2 = new Date('2021-01-01');
    const obj1 = { a: date1 };
    const obj2 = { a: date2 };
    const result = deepMerge(obj1, obj2);
    expect(result.a).toBe(date2);
  });

  it('should handle RegExp objects', () => {
    const regex1 = /test1/u;
    const regex2 = /test2/u;
    const obj1 = { a: regex1 };
    const obj2 = { a: regex2 };
    const result = deepMerge(obj1, obj2);
    expect(result.a).toBe(regex2);
  });

  it('should merge nested objects with symbols', () => {
    const sym = Symbol('nested');
    const obj1 = { a: { [sym]: 1, b: 2 } };
    const obj2 = { a: { [sym]: 3, c: 4 } };
    const result = deepMerge(obj1, obj2);
    expect((result.a as any)[sym]).toBeUndefined();
    expect(result.a.b).toBe(2);
    expect(result.a.c).toBe(4);
  });

  it('should handle empty objects', () => {
    const obj1 = {};
    const obj2 = { a: 1 };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1 });
  });

  it('should handle overriding with different types', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: 'string' };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 'string' });
  });
});

describe('deepMergeMany', () => {
  it('should merge multiple objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    const obj3 = { e: 5, f: 6 };
    expect(
      deepMergeMany(
        obj1 as Record<string, unknown>,
        obj2 as Record<string, unknown>,
        obj3 as Record<string, unknown>,
      ),
    ).toEqual({
      a: 1,
      b: { c: 2, d: 3 },
      e: 5,
      f: 6,
    });
  });

  it('should handle empty array', () => {
    expect(deepMergeMany()).toEqual({});
  });

  it('should handle single object', () => {
    const obj = { a: 1, b: 2 };
    expect(deepMergeMany(obj)).toEqual({ a: 1, b: 2 });
  });

  it('should deep merge nested objects', () => {
    const obj1 = { a: { b: { c: 1 } } };
    const obj2 = { a: { b: { d: 2 } } };
    const obj3 = { a: { e: 3 } };
    expect(
      deepMergeMany(
        obj1 as Record<string, unknown>,
        obj2 as Record<string, unknown>,
        obj3 as Record<string, unknown>,
      ),
    ).toEqual({
      a: { b: { c: 1, d: 2 }, e: 3 },
    });
  });

  it('should handle symbols as keys in multiple objects', () => {
    const sym = Symbol('test');
    const obj1 = { [sym]: 1, a: 2 };
    const obj2 = { [sym]: 3, b: 4 };
    const obj3 = { [sym]: 5, c: 6 };
    const result = deepMergeMany(obj1 as any, obj2 as any, obj3 as any);
    expect((result as any)[sym]).toBeUndefined();
    expect(result['a']).toBe(2);
    expect(result['b']).toBe(4);
    expect(result['c']).toBe(6);
  });

  it('should handle null and undefined in multiple objects', () => {
    const obj1 = { a: 1, b: null };
    const obj2 = { b: { c: 2 }, d: undefined };
    const obj3 = { d: 'defined', e: null };
    expect(deepMergeMany(obj1 as any, obj2 as any, obj3 as any)).toEqual({
      a: 1,
      b: { c: 2 },
      d: 'defined',
      e: null,
    });
  });

  it('should concatenate arrays in multiple objects', () => {
    const obj1 = { a: [1, 2] };
    const obj2 = { a: [3] };
    const obj3 = { a: [4, 5, 6] };
    expect(deepMergeMany(obj1 as any, obj2 as any, obj3 as any)).toEqual({
      a: [1, 2, 3, 4, 5, 6],
    });
  });

  it('should handle functions in multiple objects', () => {
    const fn1 = () => 1;
    const fn2 = () => 2;
    const fn3 = () => 3;
    const obj1 = { a: fn1 };
    const obj2 = { a: fn2 };
    const obj3 = { a: fn3 };
    const result = deepMergeMany(obj1 as any, obj2 as any, obj3 as any);
    expect((result as any).a).toBe(fn3);
  });

  it('should handle mixed types in multiple objects', () => {
    const obj1 = { a: 'string' };
    const obj2 = { a: 42 };
    const obj3 = { a: { b: 1 } };
    expect(deepMergeMany(obj1 as any, obj2 as any, obj3 as any)).toEqual({ a: { b: 1 } });
  });

  it('should handle Date and RegExp in multiple objects', () => {
    const date1 = new Date('2020-01-01');
    const date2 = new Date('2021-01-01');
    const regex1 = /test1/u;
    const regex2 = /test2/u;
    const obj1 = { a: date1, b: regex1 };
    const obj2 = { a: date2, b: regex2 };
    const result = deepMergeMany(obj1 as any, obj2 as any);
    expect((result as any).a).toBe(date2);
    expect((result as any).b).toBe(regex2);
  });

  it('should merge nested objects with symbols in multiple objects', () => {
    const sym = Symbol('nested');
    const obj1 = { a: { [sym]: 1, b: 2 } };
    const obj2 = { a: { [sym]: 3, c: 4 } };
    const obj3 = { a: { [sym]: 5, d: 6 } };
    const result = deepMergeMany(obj1 as any, obj2 as any, obj3 as any);
    expect((result as any).a[sym]).toBeUndefined();
    expect((result as any).a.b).toBe(2);
    expect((result as any).a.c).toBe(4);
    expect((result as any).a.d).toBe(6);
  });

  it('should handle empty objects in multiple merges', () => {
    const obj1 = {};
    const obj2 = { a: 1 };
    const obj3 = {};
    const obj4 = { b: 2 };
    expect(deepMergeMany(obj1 as any, obj2 as any, obj3 as any, obj4 as any)).toEqual({
      a: 1,
      b: 2,
    });
  });

  it('should handle overriding with different types in multiple objects', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: 'string' };
    const obj3 = { a: [1, 2, 3] };
    expect(deepMergeMany(obj1 as any, obj2 as any, obj3 as any)).toEqual({
      a: [1, 2, 3],
    });
  });
});
