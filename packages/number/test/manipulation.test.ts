import { describe, expect, it } from 'vitest';
import {
  average,
  clamp,
  formatWithSeparator,
  inRange,
  isEven,
  isNegative,
  isOdd,
  isPositive,
  max,
  min,
  parseNumberOrNull,
  random,
  randomInt,
  round,
  sum,
  toDegrees,
  toRadians,
} from '../src/manipulation';

describe('clamp', () => {
  it('should clamp values within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('round', () => {
  it('should round numbers', () => {
    expect(round(3.14159, 2)).toBe(3.14);
    expect(round(3.5)).toBe(4);
    expect(round(10.6789, 1)).toBe(10.7);
  });
});

describe('randomInt', () => {
  it('should generate random integers in range', () => {
    const result = randomInt(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('random', () => {
  it('should generate random numbers in range', () => {
    const result = random(0, 1);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('sum', () => {
  it('should calculate sum of numbers', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
    expect(sum([])).toBe(0);
  });
});

describe('average', () => {
  it('should calculate average of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
    expect(average([10, 20, 30])).toBe(20);
    expect(average([])).toBe(0);
  });
});

describe('min', () => {
  it('should find minimum value', () => {
    expect(min([3, 1, 4, 1, 5])).toBe(1);
    expect(min([10, -5, 20])).toBe(-5);
  });
});

describe('max', () => {
  it('should find maximum value', () => {
    expect(max([3, 1, 4, 1, 5])).toBe(5);
    expect(max([10, -5, 20])).toBe(20);
  });
});

describe('isEven', () => {
  it('should check if number is even', () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isEven(0)).toBe(true);
  });
});

describe('isOdd', () => {
  it('should check if number is odd', () => {
    expect(isOdd(3)).toBe(true);
    expect(isOdd(4)).toBe(false);
    expect(isOdd(1)).toBe(true);
  });
});

describe('isPositive', () => {
  it('should check if number is positive', () => {
    expect(isPositive(5)).toBe(true);
    expect(isPositive(-5)).toBe(false);
    expect(isPositive(0)).toBe(false);
  });
});

describe('isNegative', () => {
  it('should check if number is negative', () => {
    expect(isNegative(-5)).toBe(true);
    expect(isNegative(5)).toBe(false);
    expect(isNegative(0)).toBe(false);
  });
});

describe('inRange', () => {
  it('should check if number is in range', () => {
    expect(inRange(5, 0, 10)).toBe(true);
    expect(inRange(15, 0, 10)).toBe(false);
    expect(inRange(0, 0, 10)).toBe(true);
    expect(inRange(10, 0, 10)).toBe(true);
  });
});

describe('toRadians', () => {
  it('should convert degrees to radians', () => {
    expect(toRadians(180)).toBeCloseTo(Math.PI);
    expect(toRadians(90)).toBeCloseTo(Math.PI / 2);
  });
});

describe('toDegrees', () => {
  it('should convert radians to degrees', () => {
    expect(toDegrees(Math.PI)).toBeCloseTo(180);
    expect(toDegrees(Math.PI / 2)).toBeCloseTo(90);
  });
});

describe('formatWithSeparator', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatWithSeparator(1000000)).toBe('1,000,000');
    expect(formatWithSeparator(1234.56)).toBe('1,234.56');
    expect(formatWithSeparator(1000000, ' ')).toBe('1 000 000');
  });
});

describe('parseNumberOrNull', () => {
  it('should parse valid numbers', () => {
    expect(parseNumberOrNull('42')).toBe(42);
    expect(parseNumberOrNull('3.14')).toBe(3.14);
  });

  it('should return null for invalid numbers', () => {
    expect(parseNumberOrNull('invalid')).toBeNull();
    expect(parseNumberOrNull('')).toBeNull();
  });
});
