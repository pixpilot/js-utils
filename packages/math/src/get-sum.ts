export function getSum(arr: number[]): number {
  return arr.reduce((sum, num) => {
    if (typeof num !== 'number' || Number.isNaN(num)) {
      return sum;
    }

    const newNum = sum + num;
    return newNum;
  }, 0);
}
