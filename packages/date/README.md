# @pixpilot/date

A collection of utility functions for working with JavaScript dates.

## Installation

```bash
pnpm add @pixpilot/date
```

## Usage

```typescript
import {
  addDays,
  diffDays,
  formatISODate,
  isDate,
  isValidDate,
  parseDateOrNull,
} from '@pixpilot/date';

// Parse dates safely
const date = parseDateOrNull('2023-01-15'); // Date or null

// Type guards
if (isValidDate(value)) {
  // value is a valid Date object
}

// Date manipulation
const tomorrow = addDays(new Date(), 1);
const daysDiff = diffDays(new Date('2023-01-01'), new Date('2023-01-10')); // 9

// Formatting
const formatted = formatISODate(new Date()); // '2023-01-15'
```

## API

### Type Guards

- `isDate(value: unknown): value is Date` - Check if value is a Date object
- `isValidDate(value: unknown): value is Date` - Check if value is a valid Date (not Invalid Date)

### Parsing

- `parseDateOrNull(value: unknown): Date | null` - Parse a value as a Date, return null if invalid

### Date Arithmetic

- `addDays(date: Date, days: number): Date` - Add days to a date
- `addMonths(date: Date, months: number): Date` - Add months to a date
- `addYears(date: Date, years: number): Date` - Add years to a date
- `addHours(date: Date, hours: number): Date` - Add hours to a date
- `addMinutes(date: Date, minutes: number): Date` - Add minutes to a date

### Date Difference

- `diffDays(date1: Date, date2: Date): number` - Calculate difference in days
- `diffHours(date1: Date, date2: Date): number` - Calculate difference in hours
- `diffMinutes(date1: Date, date2: Date): number` - Calculate difference in minutes

### Date Boundaries

- `startOfDay(date: Date): Date` - Get start of day (00:00:00.000)
- `endOfDay(date: Date): Date` - Get end of day (23:59:59.999)
- `startOfMonth(date: Date): Date` - Get start of month
- `endOfMonth(date: Date): Date` - Get end of month

### Date Comparison

- `isSameDay(date1: Date, date2: Date): boolean` - Check if dates are on the same day
- `isPast(date: Date): boolean` - Check if date is in the past
- `isFuture(date: Date): boolean` - Check if date is in the future
- `isToday(date: Date): boolean` - Check if date is today

### Date Formatting

- `formatISODate(date: Date): string` - Format as ISO date string (YYYY-MM-DD)
- `formatISODateTime(date: Date): string` - Format as ISO datetime string (YYYY-MM-DDTHH:mm:ss)

### Date Utilities

- `getDaysInMonth(year: number, month: number): number` - Get number of days in a month
- `isLeapYear(year: number): boolean` - Check if year is a leap year

## Contributing

We welcome contributions! Please see the [main contributing guide](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
