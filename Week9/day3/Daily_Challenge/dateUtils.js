/**
 * Formats a `Date` as a `YYYY-MM-DD` key using its *local* calendar fields.
 *
 * `date.toISOString().slice(0, 10)` is the tempting one-liner here, and the
 * wrong one: `toISOString()` converts to UTC first. Anyone west of UTC
 * (most of the Americas) who opens this app in the evening would have
 * "today" quietly become "tomorrow" in the stored key, and tasks added
 * then would file under the wrong day. Building the key from
 * `getFullYear()`/`getMonth()`/`getDate()` reads the date as the calendar
 * day the user's own clock says it is.
 */
export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export { WEEKDAY_LABELS };

/**
 * Builds a full calendar grid for the given month: an array of weeks, each
 * a fixed 7 entries, including the trailing days of the previous month and
 * leading days of the next so every week row is complete. Each cell is
 * `{ date: Date, dateKey: string, inCurrentMonth: boolean }`.
 */
export function getMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const gridStart = new Date(year, month, 1 - startOffset);

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    days.push({
      date,
      dateKey: toDateKey(date),
      inCurrentMonth: date.getMonth() === month,
    });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatDayHeading(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
