import { createSelector } from '@reduxjs/toolkit';

export const selectCategories = (state) => state.categories.items;
export const selectSelectedCategoryId = (state) => state.categories.selectedCategoryId;

/**
 * Selector factory for `selectCategoryById`.
 *
 * `.find()` returns a reference that already lives inside `state.categories.items`,
 * so — unlike a `.filter()` selector — this isn't preventing a broken `===` check;
 * an unmemoised version would still return the *same* object reference on every
 * call. What memoisation buys here instead is skipping the linear scan itself:
 * without it, every render of every component that reads a category re-walks the
 * full category list. With five categories that's irrelevant; with five hundred
 * it isn't. Wrapping it in `createSelector` costs nothing and keeps the habit
 * consistent no matter how the list grows.
 *
 * A factory rather than one shared selector for the same reason as the book
 * exercise: Reselect's default cache holds one result. A single selector called
 * with a different `id` for every task row in a list would miss on every call.
 */
export const makeSelectCategoryById = () =>
  createSelector(
    [selectCategories, (state, id) => id],
    (categories, id) => categories.find((category) => category.id === id),
  );

/** Convenience default instance — fine for a single call site; see note above. */
export const selectCategoryById = makeSelectCategoryById();

/**
 * Per-category task counts (for the chip badges in CategorySelector) live in
 * `features/tasks/selectors.js` as `selectTaskCountByCategoryId`, not here —
 * that selector reads `state.tasks`, and importing it into this file in order
 * to re-export it would gain nothing while adding an import to track.
 */
