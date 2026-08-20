# Productivity Tracker — Redux Toolkit, `createSelector`, `useCallback`

Two Redux slices (`tasks`, `categories`) with cross-slice cascade deletion, three required
selectors, and a component tree built to make the `useCallback` requirement actually matter
rather than being decorative.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 17 tests across both slices' selectors
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, `reselect` 5.2.0,
React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js                          configureStore, both reducers
  features/tasks/tasksSlice.js          task CRUD, progress, completion, cascade delete
  features/tasks/selectors.js           selectTasksByCategory, selectCompletedTasks, ...
  features/tasks/selectors.test.js
  features/categories/categoriesSlice.js  category CRUD, selection
  features/categories/selectors.js        selectCategoryById, ...
  features/categories/selectors.test.js
  components/CategorySelector.jsx       select / rename / delete / add categories
  components/TaskList.jsx               filtered list + useCallback handlers
  components/TaskItem.jsx               memoized row: edit, complete, progress
  components/AddTaskForm.jsx
  components/ProgressSummary.jsx
```

## How each instruction is satisfied

| # | Requirement | Where |
|---|---|---|
| 1 | Store with reducers for tasks and categories, initial state | `app/store.js`, both slice files |
| 2 | Add/edit/delete tasks, add/edit/delete categories, update progress | `tasksSlice.js`, `categoriesSlice.js` |
| 3 | `selectTasksByCategory`, `selectCompletedTasks`, `selectCategoryById` | `tasks/selectors.js`, `categories/selectors.js` |
| 4 | `TaskList` and `CategorySelector` components using `useSelector` | `components/TaskList.jsx`, `components/CategorySelector.jsx` |
| 5 | `useCallback` for editing and completion, UI to edit/complete | `TaskList.jsx` (handlers), `TaskItem.jsx` (inline edit, checkbox) |

## Decisions worth explaining

**Categories are user-created, so the genre-selector trick from the book exercise doesn't
apply directly.** There, three genres were known in advance and each got its own named,
memoized selector. Categories here are dynamic — created and deleted at runtime — so
`selectTasksByCategory` is built by a factory, `makeSelectTasksByCategory()`, that takes
`categoryId` as a second argument at call time:

```js
export const makeSelectTasksByCategory = () =>
  createSelector(
    [selectTasks, (state, categoryId) => categoryId],
    (tasks, categoryId) => categoryId === ALL_CATEGORIES ? tasks : tasks.filter(t => t.categoryId === categoryId),
  );
```

`TaskList` builds its own instance with `useMemo(makeSelectTasksByCategory, [])`, so its cache
is only ever asked about one category per render and stays warm. A single shared instance
(exported as `selectTasksByCategory`, to match the name the exercise asks for) works fine for
one call site, but two components calling it with two different category IDs in the same pass
would thrash each other's single-entry cache — which is why `CategorySelector` uses a
different selector, `selectTaskCountByCategoryId`, for its per-chip badges: one pass over the
task list producing a `{ categoryId: count }` map, rather than N separate filtered calls.

**`selectCategoryById` is memoized for a different reason than `selectTasksByCategory`.**
`.find()` returns a reference that already exists inside the categories array, so — unlike
`.filter()` — an unmemoized version would still pass a `===` check on unrelated re-renders;
there's no broken-equality bug to fix here. What `createSelector` buys instead is skipping the
linear scan on renders where nothing relevant changed. Worth doing, but for a different reason
than the array-identity problem `selectTasksByCategory` solves — see the comment in
`categories/selectors.js`.

**`extraReducers` for the cascade delete.** Deleting a category should not leave orphaned
tasks pointing at an ID that no longer exists. The tasks slice listens for the categories
slice's `categoryDeleted` action:

```js
extraReducers: (builder) => {
  builder.addCase(categoryDeleted, (state, action) => {
    state.items = state.items.filter((t) => t.categoryId !== action.payload);
  });
},
```

Only the plain action creator crosses the file boundary — the tasks slice doesn't import or
call anything from the categories reducer, so there's no circular dependency.

**Why `useCallback` is load-bearing here, not cosmetic.** `TaskItem` is wrapped in `memo`.
That only skips a re-render if *every* prop it receives is reference-stable, including the
handler props. Redux/Immer's update model already gives you stable references for free at the
data layer: mutating one task's `progress` inside `tasksSlice.js` produces a new `items` array
(every container on the path from the state root to the mutated object gets a new reference),
but sibling task objects that weren't touched keep their old references. That data-layer
stability is wasted, though, if `TaskList` hands every `TaskItem` a fresh `onToggleComplete`
function on every render — `memo`'s prop comparison would fail regardless of whether `task`
itself changed. `useCallback` in `TaskList` is what makes the handler props as stable as the
task objects already are, so toggling one task's checkbox only re-renders that row. Each row
carries a small `r{n}` render counter in the corner so you can watch this directly: click one
checkbox and only that row's counter moves.

## Validating it

17 tests cover: genre-style filtering and its "all" fallback, completed-count arithmetic,
progress clamping to `[0, 100]`, the cascade delete when a category is removed, and
memoization — `selectTasksByCategory` returning the same array reference on repeated identical
calls and correctly recomputing (not just returning stale data) when the underlying tasks
array changes, even for an update that doesn't affect the filtered result's contents.

## What's stubbed rather than built out

Deleting the last remaining category is prevented in the UI (`canDelete={categories.length > 1}`)
rather than the reducer, so the reducer itself will happily empty the list if you dispatch
`categoryDeleted` directly — worth knowing if you extend this. Category deletion also doesn't
ask for confirmation or offer to reassign orphaned tasks to another category instead of
deleting them; cascading delete was the simpler behavior to demonstrate for `extraReducers`,
but reassignment is the more forgiving default for a real tool.
