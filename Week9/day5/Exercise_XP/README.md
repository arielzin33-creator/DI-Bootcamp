# Book Inventory Selector — Redux Toolkit + `createSelector`

A small, runnable solution to the book-inventory exercise. The point of the exercise is
`createSelector`, so the project is organised around one idea: **components read, selectors
derive, reducers write.** No component filters anything.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 12 selector tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, `reselect` 5.2.0,
React 18.3, Vite 5.4. Package versions move quickly — if you install months from now, expect
different resolved versions. The API surface used here has been stable across RTK 2.x.

## File map

```
src/
  app/store.js                     configureStore
  features/books/booksSlice.js     initial state, mock data, reducers
  features/books/selectors.js      createSelector — the heart of the exercise
  features/books/selectors.test.js validation
  components/GenreFilter.jsx       dispatches genreSelected
  components/BookList.jsx          renders selectVisibleBooks
  components/SelectorInspector.jsx live recomputation counters
```

## How each instruction is satisfied

| # | Requirement | Where |
|---|---|---|
| 1 | Store with middleware and reducers | `app/store.js` |
| 2 | Initial state: `id`, `title`, `author`, `genre` | `booksSlice.js` (`year` added for the call number) |
| 3 | `selectBooks`, `selectHorrorBooks`, `selectFantasyBooks`, `selectScienceFictionBooks` | `selectors.js` |
| 4 | `BookList` component using the selectors | `components/BookList.jsx` |
| 5 | Genre switching updates the list | `components/GenreFilter.jsx` + `selectVisibleBooks` |
| 6 | Test and validate | `selectors.test.js`, plus the on-screen inspector |

## Three decisions worth explaining

**`selectBooks` is a plain function, not a `createSelector`.**
It returns `state.books.items` unchanged. Memoising a lookup that already returns a stable
reference adds a cache check and buys nothing. Reach for `createSelector` only when the
selector *derives* new data — `filter`, `map`, `sort`, `reduce`, or an object literal.

**The genre selectors come from a factory, not one selector taking an argument.**
Reselect's default cache size is 1. A single `selectBooksByGenre(state, genre)` called
alternately with `'horror'` and `'fantasy'` would miss its cache on every call and recompute
every time. `makeSelectBooksByGenre(genre)` gives each genre its own private cache, so all
three stay warm. (Reselect 5 also offers `createSelector(..., { memoizeOptions: { maxSize: n } })`
via `weakMapMemoize`/`lruMemoize` if you prefer one selector with a larger cache — the factory
is simply the version with fewer moving parts.)

**Why memoisation matters here at all.**
`filter` returns a new array every call. Written naively:

```js
// Re-renders on every dispatched action, even unrelated ones.
const horror = useSelector((state) => state.books.items.filter((b) => b.genre === 'horror'));
```

react-redux compares selector results with `===`. A fresh array fails that check, so the
component re-renders after every action in the app. `createSelector` returns the *same* array
reference until `state.books.items` actually changes, and the re-render stops happening.

## Validating it

The test suite covers output correctness (each genre selector returns only its own genre, and
the three partitions sum to the full inventory) and memoisation behaviour:

- repeated calls return the identical array reference (`toBe`, not `toEqual`)
- dispatching `genreSelected` — which touches a different part of state — leaves
  `recomputations()` at 1
- dispatching `bookAdded` pushes it to 2

In the browser, the right-hand panel shows those same counters live. Cycle through the four
filter buttons a dozen times: each counter stops at 1. `Dispatch a no-op action` re-selects
the genre that is already active — a real action reaches the reducer, Immer sees no change,
the state reference holds, and nothing recomputes.

## Extending it

`bookAdded` and `bookRemoved` are already in the slice but have no UI. Wiring up a small form
is the natural next step, and it makes the inspector more interesting: adding a horror title
recomputes `selectHorrorBooks` and `selectGenreCounts` while leaving the fantasy and
science-fiction caches untouched.
