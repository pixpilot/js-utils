import { describe, expect, it } from 'vitest';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  diffDays,
  diffHours,
  diffMinutes,
  endOfDay,
  endOfMonth,
  formatISODate,
  formatISODateTime,
  getDaysInMonth,
  isFuture,
  isLeapYear,
  isPast,
  isSameDay,
  isToday,
  startOfDay,
  startOfMonth,
} from '../src/manipulation';

describe('addDays', () => {
  it('should add days to a date', () => {
    const date = new Date('2023-01-01');
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(6);
  });

  it('should subtract days with negative value', () => {
    const date = new Date('2023-01-05');
    const result = addDays(date, -3);
    expect(result.getDate()).toBe(2);
  });
});

describe('addMonths', () => {
  it('should add months to a date', () => {
    const date = new Date('2023-01-15');
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(2); // March
  });
});

describe('addYears', () => {
  it('should add years to a date', () => {
    const date = new Date('2023-01-01');
    const result = addYears(date, 1);
    expect(result.getFullYear()).toBe(2024);
  });
});

describe('addHours', () => {
  it('should add hours to a date', () => {
    const date = new Date('2023-01-01T12:00:00');
    const result = addHours(date, 3);
    expect(result.getHours()).toBe(15);
  });
});

describe('addMinutes', () => {
  it('should add minutes to a date', () => {
    const date = new Date('2023-01-01T12:00:00');
    const result = addMinutes(date, 30);
    expect(result.getMinutes()).toBe(30);
  });
});

describe('diffDays', () => {
  it('should calculate difference in days', () => {
    const date1 = new Date('2023-01-01');
    const date2 = new Date('2023-01-10');
    expect(diffDays(date1, date2)).toBe(9);
  });
});

describe('diffHours', () => {
  it('should calculate difference in hours', () => {
    const date1 = new Date('2023-01-01T12:00:00');
    const date2 = new Date('2023-01-01T15:00:00');
    expect(diffHours(date1, date2)).toBe(3);
  });
});

describe('diffMinutes', () => {
  it('should calculate difference in minutes', () => {
    const date1 = new Date('2023-01-01T12:00:00');
    const date2 = new Date('2023-01-01T12:30:00');
    expect(diffMinutes(date1, date2)).toBe(30);
  });
});

describe('startOfDay', () => {
  it('should get start of day', () => {
    const date = new Date('2023-01-01T15:30:45');
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('endOfDay', () => {
  it('should get end of day', () => {
    const date = new Date('2023-01-01T15:30:45');
    const result = endOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });
});

describe('startOfMonth', () => {
  it('should get start of month', () => {
    const date = new Date('2023-01-15');
    const result = startOfMonth(date);
    expect(result.getDate()).toBe(1);
  });
});

describe('endOfMonth', () => {
  it('should get end of month', () => {
    const date = new Date('2023-01-15');
    const result = endOfMonth(date);
    expect(result.getDate()).toBe(31);
  });
});

describe('isSameDay', () => {
  it('should check if dates are on same day', () => {
    const date1 = new Date('2023-01-01T10:00:00');
    const date2 = new Date('2023-01-01T15:00:00');
    expect(isSameDay(date1, date2)).toBe(true);
  });

  it('should return false for different days', () => {
    const date1 = new Date('2023-01-01');
    const date2 = new Date('2023-01-02');
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe('isPast', () => {
  it('should check if date is in the past', () => {
    const pastDate = new Date('2020-01-01');
    expect(isPast(pastDate)).toBe(true);
  });
});

describe('isFuture', () => {
  it('should check if date is in the future', () => {
    const futureDate = new Date('2099-01-01');
    expect(isFuture(futureDate)).toBe(true);
  });
});

describe('isToday', () => {
  it('should check if date is today', () => {
    const today = new Date();
    expect(isToday(today)).toBe(true);
  });

  it('should return false for other dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });
});

describe('formatISODate', () => {
  it('should format date to ISO string', () => {
    const date = new Date('2023-01-15T10:30:00');
    expect(formatISODate(date)).toBe('2023-01-15');
  });
});

describe('formatISODateTime', () => {
  it('should format date to ISO datetime string', () => {
    const date = new Date('2023-01-15T10:30:45');
    expect(formatISODateTime(date)).toBe('2023-01-15T10:30:45');
  });
});

describe('getDaysInMonth', () => {
  it('should get number of days in month', () => {
    expect(getDaysInMonth(2023, 0)).toBe(31); // January
    expect(getDaysInMonth(2023, 1)).toBe(28); // February (non-leap)
    expect(getDaysInMonth(2024, 1)).toBe(29); // February (leap)
  });
});

describe('isLeapYear', () => {
  it('should check if year is a leap year', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });
});
