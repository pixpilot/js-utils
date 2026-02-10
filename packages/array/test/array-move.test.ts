import { describe, expect, it } from 'vitest';
import { arrayMove } from '../src/index.js';

describe('arrayMove', () => {
  it('should move element forward in array', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 1, 3);
    expect(result).toEqual([1, 3, 4, 2, 5]);
  });

  it('should move element backward in array', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 3, 1);
    expect(result).toEqual([1, 4, 2, 3, 5]);
  });

  it('should return new array when from equals to', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 2, 2);
    expect(result).toEqual([1, 2, 3, 4, 5]);
    expect(result).not.toBe(input);
  });

  it('should handle negative from index', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, -2, 1);
    expect(result).toEqual([1, 4, 2, 3, 5]);
  });

  it('should handle negative to index', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 1, -2);
    expect(result).toEqual([1, 3, 4, 2, 5]);
  });

  it('should handle both negative indices', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, -3, -1);
    expect(result).toEqual([1, 2, 4, 5, 3]);
  });

  it('should return copy when from index is out of bounds (too low)', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, -10, 2);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return copy when from index is out of bounds (too high)', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 10, 2);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return copy when from index equals array length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 5, 2);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should move element to beginning', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 3, 0);
    expect(result).toEqual([4, 1, 2, 3, 5]);
  });

  it('should move element to end', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 1, 4);
    expect(result).toEqual([1, 3, 4, 5, 2]);
  });

  it('should move element from beginning', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 0, 3);
    expect(result).toEqual([2, 3, 4, 1, 5]);
  });

  it('should move element from end', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 4, 1);
    expect(result).toEqual([1, 5, 2, 3, 4]);
  });

  it('should handle single element array', () => {
    const input = [1];
    const result = arrayMove(input, 0, 0);
    expect(result).toEqual([1]);
  });

  it('should handle empty array', () => {
    const input: number[] = [];
    const result = arrayMove(input, 0, 0);
    expect(result).toEqual([]);
  });

  it('should not mutate original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    arrayMove(input, 1, 3);
    expect(input).toEqual(original);
  });

  it('should handle to index beyond array length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 1, 10);
    expect(result).toEqual([1, 3, 4, 5, 2]);
  });

  it('should handle negative to index that resolves to beginning', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, 3, -10);
    expect(result).toEqual([4, 1, 2, 3, 5]);
  });

  it('should work with strings', () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const result = arrayMove(input, 0, 2);
    expect(result).toEqual(['b', 'c', 'a', 'd', 'e']);
  });

  it('should work with objects', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = arrayMove(input, 0, 2);
    expect(result).toEqual([{ id: 2 }, { id: 3 }, { id: 1 }]);
  });

  it('should handle moving last element using negative index', () => {
    const input = [1, 2, 3, 4, 5];
    const result = arrayMove(input, -1, 0);
    expect(result).toEqual([5, 1, 2, 3, 4]);
  });

  it('should handle arrays with undefined elements', () => {
    const input = [1, undefined, 3, 4, 5];
    const result = arrayMove(input, 1, 3);
    // When moving undefined, the function filters it out
    expect(result).toEqual([1, 3, 4, 5]);
  });

  it('should handle sparse arrays', () => {
    const input = [1, 2, 3];
    input[10] = 4; // Create sparse array
    const result = arrayMove(input, 0, 2);
    expect(result[0]).toBe(2);
    expect(result[2]).toBe(1);
  });
});
