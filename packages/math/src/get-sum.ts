/**
 * Sum an array of numbers, skipping `NaN` and non-number entries.
 *
 * @param arr - The numbers to add
 * @returns The sum, or 0 for an empty array
 *
 * @example
 * ```typescript
 * getSum([1, 2, 3]); // 6
 * getSum([1, Number.NaN, 2]); // 3
 * getSum([]); // 0
 * ```
 */
export function getSum(arr: number[]): number {
  return arr.reduce((sum, num) => {
    if (typeof num !== 'number' || Number.isNaN(num)) {
      return sum;
    }

    const newNum = sum + num;
    return newNum;
  }, 0);
}
