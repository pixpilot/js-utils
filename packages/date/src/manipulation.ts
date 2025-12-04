// Constants for time calculations
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_SECOND = 1000;

const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
const MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;
const MS_PER_DAY = MS_PER_HOUR * HOURS_PER_DAY;

const HOURS_PER_DAY_END = 23;
const MINUTES_PER_HOUR_END = 59;
const SECONDS_PER_MINUTE_END = 59;
const MS_PER_SECOND_END = 999;

// Constants for leap year calculation
const LEAP_YEAR_DIVISOR = 4;
const CENTURY_DIVISOR = 100;
const FOUR_CENTURY_DIVISOR = 400;

const PAD_LENGTH = 2;

/**
 * Add days to a date.
 *
 * @param date - The source date
 * @param days - The number of days to add (can be negative)
 * @returns A new date with the days added
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-01');
 * addDays(date, 5); // 2023-01-06
 * addDays(date, -1); // 2022-12-31
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date.
 *
 * @param date - The source date
 * @param months - The number of months to add (can be negative)
 * @returns A new date with the months added
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-01');
 * addMonths(date, 2); // 2023-03-01
 * addMonths(date, -1); // 2022-12-01
 * ```
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date.
 *
 * @param date - The source date
 * @param years - The number of years to add (can be negative)
 * @returns A new date with the years added
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-01');
 * addYears(date, 1); // 2024-01-01
 * addYears(date, -1); // 2022-01-01
 * ```
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Add hours to a date.
 *
 * @param date - The source date
 * @param hours - The number of hours to add (can be negative)
 * @returns A new date with the hours added
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-01T12:00:00');
 * addHours(date, 3); // 2023-01-01T15:00:00
 * addHours(date, -2); // 2023-01-01T10:00:00
 * ```
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date.
 *
 * @param date - The source date
 * @param minutes - The number of minutes to add (can be negative)
 * @returns A new date with the minutes added
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-01T12:00:00');
 * addMinutes(date, 30); // 2023-01-01T12:30:00
 * addMinutes(date, -15); // 2023-01-01T11:45:00
 * ```
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Calculate the difference in days between two dates.
 *
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns The number of days between the dates (can be negative)
 *
 * @example
 * ```typescript
 * const date1 = new Date('2023-01-01');
 * const date2 = new Date('2023-01-10');
 * diffDays(date1, date2); // 9
 * diffDays(date2, date1); // -9
 * ```
 */
export function diffDays(date1: Date, date2: Date): number {
  const ms1 = date1.getTime();
  const ms2 = date2.getTime();
  const diff = ms2 - ms1;
  return Math.floor(diff / MS_PER_DAY);
}

/**
 * Calculate the difference in hours between two dates.
 *
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns The number of hours between the dates (can be negative)
 *
 * @example
 * ```typescript
 * const date1 = new Date('2023-01-01T12:00:00');
 * const date2 = new Date('2023-01-01T15:00:00');
 * diffHours(date1, date2); // 3
 * ```
 */
export function diffHours(date1: Date, date2: Date): number {
  const ms1 = date1.getTime();
  const ms2 = date2.getTime();
  const diff = ms2 - ms1;
  return Math.floor(diff / MS_PER_HOUR);
}

/**
 * Calculate the difference in minutes between two dates.
 *
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns The number of minutes between the dates (can be negative)
 *
 * @example
 * ```typescript
 * const date1 = new Date('2023-01-01T12:00:00');
 * const date2 = new Date('2023-01-01T12:30:00');
 * diffMinutes(date1, date2); // 30
 * ```
 */
export function diffMinutes(date1: Date, date2: Date): number {
  const ms1 = date1.getTime();
  const ms2 = date2.getTime();
  const diff = ms2 - ms1;
  return Math.floor(diff / MS_PER_MINUTE);
}

/**
 * Get the start of the day for a date (00:00:00.000).
 *
 * @param date - The source date
 * @returns A new date at the start of the day
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-01T15:30:45');
 * startOfDay(date); // 2023-01-01T00:00:00.000
 * ```
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the day for a date (23:59:59.999).
 *
 * @param date - The source date
 * @returns A new date at the end of the day
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-01T15:30:45');
 * endOfDay(date); // 2023-01-01T23:59:59.999
 * ```
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(
    HOURS_PER_DAY_END,
    MINUTES_PER_HOUR_END,
    SECONDS_PER_MINUTE_END,
    MS_PER_SECOND_END,
  );
  return result;
}

/**
 * Get the start of the month for a date.
 *
 * @param date - The source date
 * @returns A new date at the start of the month
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-15');
 * startOfMonth(date); // 2023-01-01T00:00:00.000
 * ```
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the month for a date.
 *
 * @param date - The source date
 * @returns A new date at the end of the month
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-15');
 * endOfMonth(date); // 2023-01-31T23:59:59.999
 * ```
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(
    HOURS_PER_DAY_END,
    MINUTES_PER_HOUR_END,
    SECONDS_PER_MINUTE_END,
    MS_PER_SECOND_END,
  );
  return result;
}

/**
 * Check if two dates are on the same day.
 *
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns True if the dates are on the same day, false otherwise
 *
 * @example
 * ```typescript
 * const date1 = new Date('2023-01-01T10:00:00');
 * const date2 = new Date('2023-01-01T15:00:00');
 * isSameDay(date1, date2); // true
 * ```
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is in the past.
 *
 * @param date - The date to check
 * @returns True if the date is in the past, false otherwise
 *
 * @example
 * ```typescript
 * isPast(new Date('2020-01-01')); // true (assuming current date is after 2020)
 * isPast(new Date('2099-01-01')); // false
 * ```
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future.
 *
 * @param date - The date to check
 * @returns True if the date is in the future, false otherwise
 *
 * @example
 * ```typescript
 * isFuture(new Date('2099-01-01')); // true
 * isFuture(new Date('2020-01-01')); // false (assuming current date is after 2020)
 * ```
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Check if a date is today.
 *
 * @param date - The date to check
 * @returns True if the date is today, false otherwise
 *
 * @example
 * ```typescript
 * isToday(new Date()); // true
 * isToday(new Date('2020-01-01')); // false
 * ```
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Format a date to ISO string (YYYY-MM-DD).
 *
 * @param date - The date to format
 * @returns The formatted date string
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-15T10:30:00');
 * formatISODate(date); // '2023-01-15'
 * ```
 */
export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(PAD_LENGTH, '0');
  const day = String(date.getDate()).padStart(PAD_LENGTH, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date to ISO datetime string (YYYY-MM-DDTHH:mm:ss).
 *
 * @param date - The date to format
 * @returns The formatted datetime string
 *
 * @example
 * ```typescript
 * const date = new Date('2023-01-15T10:30:45');
 * formatISODateTime(date); // '2023-01-15T10:30:45'
 * ```
 */
export function formatISODateTime(date: Date): string {
  const datePart = formatISODate(date);
  const hours = String(date.getHours()).padStart(PAD_LENGTH, '0');
  const minutes = String(date.getMinutes()).padStart(PAD_LENGTH, '0');
  const seconds = String(date.getSeconds()).padStart(PAD_LENGTH, '0');
  return `${datePart}T${hours}:${minutes}:${seconds}`;
}

/**
 * Get the number of days in a month.
 *
 * @param year - The year
 * @param month - The month (0-11)
 * @returns The number of days in the month
 *
 * @example
 * ```typescript
 * getDaysInMonth(2023, 0); // 31 (January)
 * getDaysInMonth(2023, 1); // 28 (February, non-leap year)
 * getDaysInMonth(2024, 1); // 29 (February, leap year)
 * ```
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Check if a year is a leap year.
 *
 * @param year - The year to check
 * @returns True if the year is a leap year, false otherwise
 *
 * @example
 * ```typescript
 * isLeapYear(2024); // true
 * isLeapYear(2023); // false
 * isLeapYear(2000); // true
 * isLeapYear(1900); // false
 * ```
 */
export function isLeapYear(year: number): boolean {
  return (
    (year % LEAP_YEAR_DIVISOR === 0 && year % CENTURY_DIVISOR !== 0) ||
    year % FOUR_CENTURY_DIVISOR === 0
  );
}
