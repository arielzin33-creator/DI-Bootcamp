import { createSelector } from '@reduxjs/toolkit';
import { GENRES, ALL_GENRES } from './booksSlice';

/* ------------------------------------------------------------------ *
 * 1. Input selectors
 *
 * These are plain functions that read a slice of state and return it
 * unchanged. They are deliberately NOT wrapped in `createSelector`:
 * memoising a function that only reads an existing reference buys
 * nothing and costs a cache lookup. Wrap a selector only when it
 * *derives* new data (filter, map, sort, reduce, object literal).
 * ------------------------------------------------------------------ */

/** All books in the inventory. */
export const selectBooks = (state) => state.books.items;

/** The genre currently chosen in the UI. */
export const selectSelectedGenre = (state) => state.books.selectedGenre;

/* ------------------------------------------------------------------ *
 * 2. Derived selectors
 *
 * `filter` returns a NEW array on every call. Without memoisation,
 * `useSelector(state => state.books.items.filter(...))` would return a
 * referentially different array after every dispatched action, and
 * react-redux — which compares results with `===` — would re-render the
 * component every time, even when the underlying books never changed.
 *
 * `createSelector` fixes this: it recomputes the result function only
 * when at least one input selector returns a new reference. Otherwise it
 * hands back the previously cached array, so `===` holds and the
 * component stays put.
 * ------------------------------------------------------------------ */

/**
 * Selector factory. Each call returns an independent memoised selector
 * with its own private cache.
 *
 * Why a factory rather than one selector taking `genre` as an argument?
 * Reselect's default cache size is 1. A single shared selector called
 * alternately with 'horror' and 'fantasy' would thrash: every call would
 * miss the cache and recompute. One selector per genre means one cache
 * per genre, and all of them stay warm.
 */
export const makeSelectBooksByGenre = (genre) =>
  createSelector([selectBooks], (books) => books.filter((book) => book.genre === genre));

export const selectHorrorBooks = makeSelectBooksByGenre(GENRES.HORROR);
export const selectFantasyBooks = makeSelectBooksByGenre(GENRES.FANTASY);
export const selectScienceFictionBooks = makeSelectBooksByGenre(GENRES.SCIENCE_FICTION);

/**
 * The list the UI actually renders: dispatches to the correct
 * per-genre selector based on the current filter.
 *
 * Note that this selector composes *other selectors* rather than
 * re-filtering. The genre selectors below it are already memoised, so
 * switching from Horror to Fantasy and back is two cache hits, not two
 * fresh passes over the inventory.
 */
export const selectVisibleBooks = createSelector(
  [
    selectSelectedGenre,
    selectBooks,
    selectHorrorBooks,
    selectFantasyBooks,
    selectScienceFictionBooks,
  ],
  (genre, allBooks, horror, fantasy, scienceFiction) => {
    switch (genre) {
      case GENRES.HORROR:
        return horror;
      case GENRES.FANTASY:
        return fantasy;
      case GENRES.SCIENCE_FICTION:
        return scienceFiction;
      case ALL_GENRES:
      default:
        return allBooks;
    }
  },
);

/** Book count per genre, for the filter buttons. */
export const selectGenreCounts = createSelector(
  [selectBooks, selectHorrorBooks, selectFantasyBooks, selectScienceFictionBooks],
  (allBooks, horror, fantasy, scienceFiction) => ({
    [ALL_GENRES]: allBooks.length,
    [GENRES.HORROR]: horror.length,
    [GENRES.FANTASY]: fantasy.length,
    [GENRES.SCIENCE_FICTION]: scienceFiction.length,
  }),
);
