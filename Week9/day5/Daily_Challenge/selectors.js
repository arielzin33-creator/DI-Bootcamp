import { createSelector } from '@reduxjs/toolkit';
import { ALL_CATEGORIES } from '../categories/categoriesSlice';

export const selectTasks = (state) => state.tasks.items;

/* ------------------------------------------------------------------ *
 * selectTasksByCategory
 *
 * Same reasoning as the genre selectors in the book-inventory exercise:
 * `.filter()` returns a new array reference every call, so this has to be
 * memoised or react-redux's `===` check fails and consumers re-render on
 * every dispatched action, not just the ones that touch tasks.
 *
 * Categories are user-created here (unlike the book exercise's fixed three
 * genres), so there's no way to pre-declare one named selector per category.
 * The factory takes `categoryId` as a second argument at call time instead.
 * `makeSelectTasksByCategory()` gives each *call site* — not each category —
 * its own cache. A component that only ever asks about one category at a
 * time (TaskList, filtered by the current selection) should build its own
 * instance with `useMemo(makeSelectTasksByCategory, [])` so repeated calls
 * with the same category stay cache hits. The default export below is a
 * single shared instance, fine for one call site, but two components
 * calling it with two different category IDs on the same render would
 * thrash each other's cache — see the useMemo pattern in TaskList.jsx.
 * ------------------------------------------------------------------ */
export const makeSelectTasksByCategory = () =>
  createSelector(
    [selectTasks, (state, categoryId) => categoryId],
    (tasks, categoryId) =>
      categoryId == null || categoryId === ALL_CATEGORIES
        ? tasks
        : tasks.filter((task) => task.categoryId === categoryId),
  );

export const selectTasksByCategory = makeSelectTasksByCategory();

/** Count of tasks marked complete. */
export const selectCompletedTasks = createSelector(
  [selectTasks],
  (tasks) => tasks.filter((task) => task.completed).length,
);

/** Total / completed / remaining in one object, for the summary panel. */
export const selectTaskStats = createSelector(
  [selectTasks, selectCompletedTasks],
  (tasks, completed) => ({
    total: tasks.length,
    completed,
    remaining: tasks.length - completed,
  }),
);

/**
 * One linear pass producing a `{ categoryId: count }` lookup, used to badge
 * every category chip at once. This is the alternative to calling a
 * per-category selector N times when N categories need to be shown
 * together: one selector, one array traversal, one cache entry.
 */
export const selectTaskCountByCategoryId = createSelector([selectTasks], (tasks) =>
  tasks.reduce((counts, task) => {
    counts[task.categoryId] = (counts[task.categoryId] ?? 0) + 1;
    return counts;
  }, {}),
);
