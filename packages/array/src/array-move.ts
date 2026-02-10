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
