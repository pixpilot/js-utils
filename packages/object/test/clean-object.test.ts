import { expectTypeOf } from 'vitest';
import { cleanObject } from '../src/clean-object';

describe('cleanObject', () => {
  it('should be defined', () => {
    expect(cleanObject).toBeDefined();
  });

  it('should preserve the input type (generic)', () => {
    const input = {
      a: 1,
      b: undefined as number | undefined,
      c: {
        d: 'd',
      },
    };

    const output = cleanObject(input);

    expectTypeOf(output).toEqualTypeOf<typeof input>();
  });

  it('should clean object', () => {
    expect(cleanObject({ a: { b: 'b', c: {} } })).toStrictEqual({ a: { b: 'b' } });
    expect(cleanObject(['1', []])).toStrictEqual(['1']);
  });

  it('should not mutate the input object/array', () => {
    const input = {
      a: {
        b: undefined as unknown,
        c: 1,
      },
      d: [undefined, 2, {}],
    };

    cleanObject(input);

    expect(input).toStrictEqual({
      a: {
        b: undefined,
        c: 1,
      },
      d: [undefined, 2, {}],
    });
  });

  it('should ignore primitive types', () => {
    expect(cleanObject('a')).toStrictEqual('a');
    expect(cleanObject(1)).toStrictEqual(1);
    expect(cleanObject(true)).toStrictEqual(true);
    expect(cleanObject(null)).toStrictEqual(null);

    const data = new Date(1995, 11, 17);
    expect(cleanObject(data)).toStrictEqual(data);
  });

  it('should pick defined values from the object', () => {
    const object = {
      bar: {},
      biz: [],
      foo: {
        bar: undefined,
        baz: true,
        biz: false,
        buz: null,
        net: '',
        qux: 100,
      },
    };

    expect(cleanObject(object)).toEqual({
      foo: {
        baz: true,
        biz: false,
        qux: 100,
      },
    });
  });

  it('should clean arrays', () => {
    const object = {
      foo: [
        {
          bar: undefined,
          baz: '',
          biz: 0,
        },
      ],
    };

    expect(cleanObject(object)).toEqual({
      foo: [
        {
          biz: 0,
        },
      ],
    });
  });

  it('should include non plain objects', () => {
    const object = {
      foo: {
        bar: new Date(0),
        biz: undefined,
      },
    };

    expect(cleanObject(object)).toEqual({
      foo: {
        bar: new Date(0),
      },
    });
  });

  it('should support `transform` and run it before cleaning', () => {
    const object = {
      a: '  ',
      b: ' x ',
      c: {
        d: '   ',
        e: 'ok',
      },
    };

    expect(
      cleanObject(object, {
        transform: (_key, value) => {
          if (typeof value === 'string') {
            return value.trim();
          }

          return value;
        },
      }),
    ).toEqual({
      b: 'x',
      c: {
        e: 'ok',
      },
    });
  });

  it('should support `shouldRemove` (including using the base container)', () => {
    const base = {
      keep: 1,
      remove: 2,
      nested: {
        keep: 3,
        remove: 4,
      },
    };

    const seenBases: unknown[] = [];

    expect(
      cleanObject(base, {
        shouldRemove: (key, _value, container) => {
          seenBases.push(container);
          return key === 'remove';
        },
      }),
    ).toEqual({
      keep: 1,
      nested: {
        keep: 3,
      },
    });

    expect(seenBases).toContain(base);
    expect(seenBases).toContain(base.nested);
  });

  it('should support custom values', () => {
    const object = {
      biz: {
        baz: 123,
      },
      foo: {
        bar: 'abc',
      },
    };

    expect(cleanObject(object, { cleanValues: ['abc'] })).toEqual({
      biz: {
        baz: 123,
      },
    });
  });

  it('should support `cleanValues` for non-string values (including NaN)', () => {
    const object = {
      a: 0,
      b: false,
      c: Number.NaN,
      d: null,
      e: 1,
      f: 'keep',
    };

    expect(
      cleanObject(object, {
        nullValues: false,
        cleanValues: [0, false, Number.NaN, null],
      }),
    ).toEqual({
      e: 1,
      f: 'keep',
    });
  });

  it('should include empty objects if `emptyObjects` is `false`', () => {
    const object = {
      biz: {
        baz: 123,
      },
      foo: {
        bar: {},
      },
    };

    expect(cleanObject(object, { emptyObjects: false })).toEqual({
      biz: {
        baz: 123,
      },
      foo: {
        bar: {},
      },
    });
  });

  it('should include empty arrays if `emptyArrays` is `false`', () => {
    const object = {
      biz: {
        bar: [],
        baz: 123,
      },
      foo: [],
    };

    expect(cleanObject(object, { emptyArrays: false })).toEqual({
      biz: {
        bar: [],
        baz: 123,
      },
      foo: [],
    });
  });

  it('should include empty strings if `emptyStrings` is `false`', () => {
    const object = {
      foo: {
        bar: '',
        biz: 123,
      },
    };

    expect(cleanObject(object, { emptyStrings: false })).toEqual({
      foo: {
        bar: '',
        biz: 123,
      },
    });
  });

  it('should exclude NaN values', () => {
    const object = {
      bar: Number.NaN,
      foo: {
        bar: Number.NaN,
        biz: 33,
        qux: [Number.NaN, 1, { foo: 'foo' }],
      },
    };

    expect(cleanObject(object, { NaNValues: true })).toEqual({
      foo: {
        biz: 33,
        qux: [1, { foo: 'foo' }],
      },
    });
  });

  it('should include NaN values if `NaNValues` is `false`', () => {
    const object = {
      bar: Number.NaN,
      foo: {
        bar: Number.NaN,
        biz: null,
        qux: [Number.NaN, undefined, { foo: 'foo' }],
      },
    };

    expect(cleanObject(object, { NaNValues: false })).toEqual({
      bar: Number.NaN,
      foo: {
        bar: Number.NaN,
        qux: [Number.NaN, { foo: 'foo' }],
      },
    });
  });

  it('should include null values if `nullValues` is `false`', () => {
    const object = {
      foo: {
        bar: null,
        biz: 123,
      },
    };

    expect(cleanObject(object, { nullValues: false })).toEqual({
      foo: {
        bar: null,
        biz: 123,
      },
    });
  });

  it('should include undefined values if `undefinedValues` is `false`', () => {
    const object = {
      foo: {
        bar: undefined,
        biz: 123,
        qux: [undefined, {}, true],
      },
    };

    expect(cleanObject(object, { undefinedValues: false })).toEqual({
      foo: {
        bar: undefined,
        biz: 123,
        qux: [undefined, true],
      },
    });
  });

  it('should remove specified keys if `cleanKeys` is passed', () => {
    const object = {
      foo: {
        alsoMe: {
          biz: 123,
        },
        bar: undefined,
        biz: 123,
        qux: [undefined, {}, true],
        removeMe: true,
      },
      removeMe: true,
    };

    expect(cleanObject(object, { cleanKeys: ['removeMe', 'alsoMe'] })).toEqual({
      foo: {
        biz: 123,
        qux: [true],
      },
    });
  });

  it('should apply `cleanKeys` to array indices (as strings)', () => {
    expect(cleanObject(['a', 'b', 'c'], { cleanKeys: ['1'] })).toEqual(['a', 'c']);
  });

  it('should support `transform` for arrays', () => {
    expect(
      cleanObject([' a ', '   ', 'b'], {
        transform: (_key, value) => {
          if (typeof value === 'string') {
            return value.trim();
          }

          return value;
        },
      }),
    ).toEqual(['a', 'b']);
  });

  it('should support `shouldRemove` for arrays', () => {
    expect(
      cleanObject(['a', 'b', 'c'], {
        shouldRemove: (key) => key === '1',
      }),
    ).toEqual(['a', 'c']);
  });

  it('should preserve null-prototype objects', () => {
    const object = Object.create(null) as Record<string, unknown>;
    object['a'] = undefined;
    object['b'] = 1;

    const cleaned = cleanObject(object);

    expect(Object.getPrototypeOf(cleaned)).toBeNull();
    expect(cleaned).toEqual({ b: 1 });
  });
});
