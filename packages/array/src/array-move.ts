/**
 * Move an item to another index, returning a new array (the input is not mutated).
 *
 * Negative indices count from the end. If `from` is out of range, an unchanged copy is returned.
 *
 * @param array - The source array
 * @param from - Index of the item to move (negative counts from the end)
 * @param to - Index to move the item to (negative counts from the end)
 * @returns A new array with the item moved
 *
 * @example
 * ```typescript
 * arrayMove(['a', 'b', 'c'], 0, 2); // ['b', 'c', 'a']
 * arrayMove(['a', 'b', 'c'], -1, 0); // ['c', 'a', 'b']
 * ```
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  if (from === to) return array.slice();

  const next = array.slice();
  const startIndex = from < 0 ? next.length + from : from;
  if (startIndex < 0 || startIndex >= next.length) return next;

  const endIndex = to < 0 ? next.length + to : to;

  const [item] = next.splice(startIndex, 1);
  if (item === undefined) return next;

  next.splice(endIndex, 0, item);
  return next;
}
