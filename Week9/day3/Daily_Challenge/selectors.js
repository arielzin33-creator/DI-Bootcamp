import { createSelector } from '@reduxjs/toolkit';

export const selectSelectedDate = (state) => state.planner.selectedDate;
export const selectTasksByDate = (state) => state.planner.tasksByDate;

/**
 * Referenced once, reused every time a selected date has no tasks yet —
 * rather than writing `tasksByDate[date] ?? []` inline, which would
 * allocate a *new* empty array on every single call. `useSelector` compares
 * results with `===`; a fresh `[]` every render would fail that check
 * every time, exactly the referential-stability problem `createSelector`
 * exists to prevent elsewhere in this series — worth avoiding here too,
 * even though this isn't a `.filter()` call.
 */
const EMPTY_TASKS = [];

/** The tasks for whichever date is currently selected. */
export const selectTasksForSelectedDate = createSelector(
  [selectTasksByDate, selectSelectedDate],
  (tasksByDate, selectedDate) => tasksByDate[selectedDate] ?? EMPTY_TASKS,
);

/**
 * A `Set` of every date key that has at least one task — used by the
 * calendar to put a marker under days worth revisiting, without the
 * calendar needing to know anything about task shape or count.
 */
export const selectDatesWithTasks = createSelector([selectTasksByDate], (tasksByDate) => {
  const dates = Object.keys(tasksByDate).filter((date) => tasksByDate[date].length > 0);
  return new Set(dates);
});
