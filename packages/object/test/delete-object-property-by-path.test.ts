import { describe, expect, it } from 'vitest';
import { deleteObjectPropertyByPath } from '../src/delete-object-property-by-path';

describe('deleteObjectPropertyByPath', () => {
  it('should delete nested properties', () => {
    const obj = { a: { b: { c: 42, d: 43 } } };
    deleteObjectPropertyByPath(obj, 'a.b.c');
    expect(obj).toEqual({ a: { b: { d: 43 } } });
  });

  it('should handle deleting non-existent paths', () => {
    const obj = { a: { b: {} } };
    deleteObjectPropertyByPath(obj, 'a.b.x');
    expect(obj).toEqual({ a: { b: {} } });
  });

  it('should handle empty path', () => {
    const obj = { a: 1 };
    deleteObjectPropertyByPath(obj, '');
    expect(obj).toEqual({ a: 1 });
  });

  it('should handle null object', () => {
    const obj = null as any;
    deleteObjectPropertyByPath(obj, 'a');
    expect(obj).toBe(null);
  });

  it('should handle undefined object', () => {
    const obj = undefined as any;
    deleteObjectPropertyByPath(obj, 'a');
    expect(obj).toBeUndefined();
  });

  it('should handle primitive values', () => {
    const obj = 42 as any;
    deleteObjectPropertyByPath(obj, 'a');
    expect(obj).toBe(42);
  });

  it('should handle array paths', () => {
    const obj = { a: [{ b: 1 }, { b: 2 }] };
    deleteObjectPropertyByPath(obj, 'a.0.b');
    expect(obj).toEqual({ a: [{}, { b: 2 }] });
  });

  it('should handle deep nesting', () => {
    const obj = { a: { b: { c: { d: { e: 42 } } } } };
    deleteObjectPropertyByPath(obj, 'a.b.c.d.e');
    expect(obj).toEqual({ a: { b: { c: { d: {} } } } });
  });

  it('should handle paths with special characters', () => {
    const obj = { 'a.b': { c: 42 } };
    deleteObjectPropertyByPath(obj, ['a.b', 'c']);
    expect(obj).toEqual({ 'a.b': {} });
  });

  it('should handle array as path', () => {
    const obj = { a: { b: { c: 42 } } };
    deleteObjectPropertyByPath(obj, ['a', 'b', 'c']);
    expect(obj).toEqual({ a: { b: {} } });
  });

  it('should handle empty segments in path', () => {
    const obj = { a: { '': { b: 42 } } };
    deleteObjectPropertyByPath(obj, 'a..b');
    expect(obj).toEqual({ a: { '': {} } });
  });
});
