import { getSum } from '../src';

describe('getSum', () => {
  it('should be defined', () => {
    expect(getSum).toBeDefined();
  });

  it('should return sum', () => {
    expect(getSum([1, 2])).toBe(3);
    expect(getSum([-1, -2])).toBe(-3);
    expect(getSum([0])).toBe(0);
  });

  it('should return 0 for an empty array', () => {
    expect(getSum([])).toBe(0);
  });

  it('should ignore non-numeric values and NaN', () => {
    expect(getSum([1, '2', null, undefined, {}, Number.NaN] as unknown as number[])).toBe(
      1,
    );
  });

  it('should keep special number values', () => {
    expect(getSum([1, Number.POSITIVE_INFINITY])).toBe(Number.POSITIVE_INFINITY);
    expect(getSum([1, Number.NEGATIVE_INFINITY])).toBe(Number.NEGATIVE_INFINITY);
  });

  it('should not return sum for NaN only', () => {
    expect(getSum([Number.NaN])).toBe(0);
  });
});
