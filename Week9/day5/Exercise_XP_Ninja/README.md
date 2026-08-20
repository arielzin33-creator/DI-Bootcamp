# Todo List with Filters — Redux Toolkit, `createSelector`, `useCallback`

One slice (`todos`), the three required selectors, and a `TodoList` component built around
`memo` + `useCallback`, consistent with the pattern used across this whole exercise series.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 11 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, `reselect` 5.2.0,
React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js
  features/todos/todosSlice.js        items, visibilityFilter, CRUD reducers
  features/todos/selectors.js         selectTodos, selectVisibilityFilter, selectFilteredTodosCount
  features/todos/selectors.test.js
  components/TodoList.jsx             the required component
  components/TodoItem.jsx             memoized row
  components/VisibilityFilterTabs.jsx
  components/AddTodoForm.jsx
```

## How each instruction is satisfied

| # | Requirement | Where |
|---|---|---|
| 1 | Store, reducers, initial state with todos + visibility filter | `app/store.js`, `todosSlice.js` |
| 2 | Add / toggle / remove todos, update the filter | `todosSlice.js` |
| 3 | `selectTodos`, `selectVisibilityFilter`, `selectFilteredTodosCount` | `selectors.js` |
| 4 | `TodoList`: `useSelector` for todos + filter, render with delete buttons, show count, `useCallback` for toggle/delete | `components/TodoList.jsx` |

## A correction, stated plainly

While writing this exercise's test for `selectTodos`'s memoisation, a test that had worked in
the same shape for the previous three exercises in this series started failing unpredictably.
Chasing it down turned up something I'd stated inaccurately in all three earlier READMEs and
several code comments: I wrote that "Reselect's default cache size is 1" / "a single-entry
cache" — describing the classic Reselect behavior, where a memoised selector remembers only its
*most recent* call and evicts that on the very next call with different arguments.

I checked the actual installed dependency directly rather than continue relying on that
assumption:

```js
const s = createSelector([x => x], x => x);
console.log(s.memoize.name); // 'weakMapMemoize'
```

`@reduxjs/toolkit` 2.x's `createSelector` (built on Reselect 5.x) defaults to `weakMapMemoize`,
not the single-slot cache. I confirmed the practical difference directly too: calling a selector
with arguments `A`, then `B`, then `A` again, the classic single-slot cache would recompute on
every one of those three calls (each a miss against whatever was cached from the call before).
`weakMapMemoize` recomputed only on the first two calls — returning to `A` was a cache *hit*,
because it had kept `A`'s result on the side rather than discarding it when `B` came in.

This is why the memoisation test in `selectors.test.js` below constructs a deliberately
never-before-seen `items` array rather than reusing the module's seeded todos: with a cache that
now remembers many past calls instead of just one, reusing state this test file had already
exercised elsewhere made the outcome depend on test order.

**What this does and doesn't change:** the actual apps in all four exercises are unaffected —
every selector still returns correct results regardless of which caching strategy sits under
`createSelector`, and the earlier claim was about explaining *why* certain patterns help, not
about anything the shipped code did wrong. But the specific mechanism I described — "a shared
selector thrashes because the cache only holds one entry" — is the *pre-5.x* Reselect story, and
stating it as current fact was a mistake I should flag rather than let stand uncorrected. The
practical guidance (give each component instance its own selector via
`useMemo(makeSelectX, [])`) still holds, but for a different, less certain reason than I gave: my
understanding is that `weakMapMemoize`'s cache can grow without an upper bound when a shared
selector is called over an app's lifetime with many distinct primitive arguments (an ever-growing
plain `Map` at the leaf level, rather than an LRU eviction) — but I haven't verified that specific
memory-growth behavior directly the way I verified the two facts above, so I'd treat it as my
best understanding rather than something I've confirmed the way I confirmed the caching change
itself. If it matters for a real project, Redux Toolkit's own selector documentation is the
place to check for current, authoritative guidance rather than taking my word for it.

I haven't gone back and edited the first three exercises' files to correct this — happy to if
you'd like, since the same "cache size 1" language appears in the book inventory, productivity
tracker, and shopping cart READMEs and a few selector comments.

## Decisions worth explaining

**`selectTodos` does the exercise's filtering, `selectFilteredTodosCount` is built on top of it**
rather than re-filtering independently — the same "compose a smaller selector into a larger one"
shape as `selectVisibleBooks` and `calculateTotalPrice` in the earlier exercises. Switching tabs
recomputes the visible list once; the count comes along for free.

**`selectTodoStats` is deliberately built on `selectTodoItems`, not `selectTodos`.** The exercise
asks for a *filtered* count, which is what `selectFilteredTodosCount` gives — but a footer that
only ever reported the filtered count would say "2 items" while looking at the Completed tab,
which reads as "2 things left to do" if you're not paying close attention. `selectTodoStats`
stays anchored to the whole list so `VisibilityFilterTabs` can show "3 left" that means the same
thing regardless of which tab is open.

**Why `useCallback` matters here, concretely — same demonstration as the last two exercises.**
`TodoItem` is `memo`-wrapped; `TodoList` builds `handleToggle` and `handleDelete` once with
`useCallback` rather than writing `onClick={() => dispatch(todoToggled(todo.id))}` inline inside
the `.map()`. Each row carries a small `r{n}` render counter — toggle one checkbox and only that
row's counter moves, because Immer gives untouched sibling todo objects stable references for
free, and the stable handler props are what let `memo` actually act on that.

## Validating it

11 tests cover: filtering under all three visibility states, `selectFilteredTodosCount` tracking
whichever filter is active, `selectTodoStats` staying filter-independent, the add/toggle/remove/
clear-completed reducers, and the corrected memoisation test described above.

## What's stubbed rather than built out

There's no editing of existing todo text — only add, toggle, and delete, matching the exercise's
scope. There's also no persistence between page loads.
