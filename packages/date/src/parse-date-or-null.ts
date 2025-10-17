/**
 * Parses a value as a Date object, returning null if the value cannot be parsed as a valid date.
 *
 * @param value - The value to parse as a date. Can be a string, number, or Date object.
 * @returns A Date object if the value is a valid date, otherwise null.
 */
export function parseDateOrNull(value: unknown): Date | null {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}
