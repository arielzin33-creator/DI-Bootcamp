import { createSelector } from '@reduxjs/toolkit'

export const selectBooksState = (state) => state.books.items

// Recompute counters exist purely to make memoization visible in the UI:
// each counter only increments when the selector's filter function actually
// re-runs (i.e. when `books.items` changes identity), not on every render.
export const recomputeCounts = {
  all: 0,
  horror: 0,
  fantasy: 0,
  scienceFiction: 0,
}

export const selectBooks = createSelector([selectBooksState], (books) => {
  recomputeCounts.all += 1
  return books
})

export const selectHorrorBooks = createSelector([selectBooksState], (books) => {
  recomputeCounts.horror += 1
  return books.filter((book) => book.genre === 'Horror')
})

export const selectFantasyBooks = createSelector([selectBooksState], (books) => {
  recomputeCounts.fantasy += 1
  return books.filter((book) => book.genre === 'Fantasy')
})

export const selectScienceFictionBooks = createSelector([selectBooksState], (books) => {
  recomputeCounts.scienceFiction += 1
  return books.filter((book) => book.genre === 'Science Fiction')
})
