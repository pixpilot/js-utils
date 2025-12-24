import { describe, expect, it } from 'vitest';
import {
  deepClone,
  deepEqual,
  flatKeys,
  getProperty,
  hasProperty,
  mapKeys,
  mapValues,
  omit,
  pick,
  setProperty,
} from '../src/manipulation';

describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('should handle missing keys', () => {
    const obj = { a: 1, b: 2 };
    expect(pick(obj, ['a', 'c'] as (keyof typeof obj)[])).toEqual({ a: 1 });
  });
});

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });
});

describe('get', () => {
  it('should get nested values', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(getProperty(obj, 'a.b.c')).toBe(42);
  });

  it('should return default value for missing paths', () => {
    const obj = { a: { b: {} } };
    expect(getProperty(obj, 'a.b.x', 'default')).toBe('default');
  });

  it('should return undefined', () => {
    const obj = { a: { b: {} } };
    expect(getProperty(obj, 'a.b.x')).toBeUndefined();
  });
});

describe('set', () => {
  it('should set nested values', () => {
    const obj = { a: { b: {} } };
    setProperty(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  it('should create missing paths', () => {
    const obj = {};
    setProperty(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });
});

describe('has', () => {
  it('should check if paths exist', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(hasProperty(obj, 'a.b.c')).toBe(true);
    expect(hasProperty(obj, 'a.b.x')).toBe(false);
  });
});

describe('flatKeys', () => {
  it('should return all keys including nested', () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
    expect(flatKeys(obj)).toEqual(['a', 'b.c', 'b.d.e']);
  });
});

describe('deepClone', () => {
  it('should deep clone objects', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    cloned.b.c = 3;
    expect(obj.b.c).toBe(2);
  });

  it('should clone dates', () => {
    const date = new Date('2023-01-01');
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
  });

  it('should clone arrays', () => {
    const arr = [1, { a: 2 }] as const;
    const cloned = deepClone(arr);
    if (typeof cloned[1] === 'object' && cloned[1] !== null) {
      (cloned[1] as { a: number }).a = 3;
    }
    const original = arr[1];
    if (typeof original === 'object') {
      expect(original.a).toBe(2);
    }
  });
});

describe('deepEqual', () => {
  it('should compare objects deeply', () => {
    expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('should compare arrays', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('should compare dates', () => {
    const date = new Date('2023-01-01');
    expect(deepEqual(date, new Date('2023-01-01'))).toBe(true);
    expect(deepEqual(date, new Date('2023-01-02'))).toBe(false);
  });
});

describe('mapValues', () => {
  it('should map over object values', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = mapValues(obj, (value) => value * 2);
    expect(result).toEqual({ a: 2, b: 4, c: 6 });
  });
});

describe('mapKeys', () => {
  it('should map over object keys', () => {
    const obj = { a: 1, b: 2 };
    const result = mapKeys(obj, (key) => key.toUpperCase());
    expect(result).toEqual({ A: 1, B: 2 });
  });
});
