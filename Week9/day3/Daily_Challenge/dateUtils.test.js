import { describe, it, expect } from 'vitest';
import { toDateKey, getMonthGrid, formatMonthLabel } from './dateUtils';

describe('toDateKey', () => {
  it('formats using local calendar fields, not UTC', () => {
    // A local time late in the evening. If this were built with
    // `toISOString()`, a timezone west of UTC would push this into the
    // next UTC day and produce the wrong key.
    const lateEvening = new Date(2024, 2, 15, 23, 30); // March 15, 2024, 11:30 PM local
    expect(toDateKey(lateEvening)).toBe('2024-03-15');
  });

  it('pads single-digit months and days', () => {
    const date = new Date(2024, 0, 5); // Jan 5, 2024
    expect(toDateKey(date)).toBe('2024-01-05');
  });
});

describe('getMonthGrid', () => {
  it('produces complete weeks of 7 days each', () => {
    const weeks = getMonthGrid(2024, 1); // February 2024
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  it('marks days outside the requested month as not in the current month', () => {
    const weeks = getMonthGrid(2024, 1); // February 2024 (leap year, 29 days)
    const allDays = weeks.flat();
    const februaryDays = allDays.filter((d) => d.inCurrentMonth);
    expect(februaryDays).toHaveLength(29);
  });

  it('includes every day of the target month exactly once', () => {
    const weeks = getMonthGrid(2024, 1);
    const februaryKeys = weeks
      .flat()
      .filter((d) => d.inCurrentMonth)
      .map((d) => d.dateKey);
    expect(new Set(februaryKeys).size).toBe(29);
    expect(februaryKeys).toContain('2024-02-01');
    expect(februaryKeys).toContain('2024-02-29');
  });
});

describe('formatMonthLabel', () => {
  it('includes the month name and year', () => {
    expect(formatMonthLabel(2024, 1)).toMatch(/February/);
    expect(formatMonthLabel(2024, 1)).toMatch(/2024/);
  });
});
