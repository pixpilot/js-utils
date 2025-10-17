import { describe, expect, it } from 'vitest';
import {
  capitalize,
  capitalizeFirst,
  normalizeSpaces,
  padEnd,
  padStart,
  removeWhitespace,
  repeat,
  reverse,
  truncate,
  words,
} from '../src/manipulation';

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should use custom ellipsis', () => {
    expect(truncate('Hello World', 5, '…')).toBe('Hello…');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('should not change rest of string', () => {
    expect(capitalize('WORLD')).toBe('WORLD');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('capitalizeFirst', () => {
  it('should capitalize first letter and lowercase rest', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
    expect(capitalizeFirst('WORLD')).toBe('World');
    expect(capitalizeFirst('hELLO wORLD')).toBe('Hello world');
  });
});

describe('reverse', () => {
  it('should reverse strings', () => {
    expect(reverse('hello')).toBe('olleh');
    expect(reverse('abc123')).toBe('321cba');
  });
});

describe('removeWhitespace', () => {
  it('should remove all whitespace', () => {
    expect(removeWhitespace('hello world')).toBe('helloworld');
    expect(removeWhitespace('  a  b  c  ')).toBe('abc');
  });
});

describe('normalizeSpaces', () => {
  it('should normalize multiple spaces to single space', () => {
    expect(normalizeSpaces('hello    world')).toBe('hello world');
    expect(normalizeSpaces('a  b  c')).toBe('a b c');
  });

  it('should trim leading and trailing spaces', () => {
    expect(normalizeSpaces('  hello  world  ')).toBe('hello world');
  });
});

describe('padStart', () => {
  it('should pad strings at the start', () => {
    expect(padStart('5', 3, '0')).toBe('005');
    expect(padStart('hello', 10)).toBe('     hello');
  });
});

describe('padEnd', () => {
  it('should pad strings at the end', () => {
    expect(padEnd('5', 3, '0')).toBe('500');
    expect(padEnd('hello', 10)).toBe('hello     ');
  });
});

describe('repeat', () => {
  it('should repeat strings', () => {
    expect(repeat('ha', 3)).toBe('hahaha');
    expect(repeat('*', 5)).toBe('*****');
  });
});

describe('words', () => {
  it('should extract words from strings', () => {
    expect(words('hello world')).toEqual(['hello', 'world']);
    expect(words('one-two_three')).toEqual(['one', 'two', 'three']);
    expect(words('camelCaseString')).toEqual(['camel', 'Case', 'String']);
  });
});
