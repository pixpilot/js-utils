import { describe, expect, it } from 'vitest';
import { toCamelCase } from '../src/case';

describe('toCamelCase', () => {
  it('should convert a string to camel case', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld');
  });
});
