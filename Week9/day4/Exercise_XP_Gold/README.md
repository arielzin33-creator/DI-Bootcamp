# Todo List with Thunks — Redux Toolkit, async fetch, four small components

One slice, one thunk, and the four components the exercise names individually: `TodoList`,
`AddTodo`, `ToggleTodo`, `RemoveTodo`.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 12 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0, React 18.3, Vite 5.4.

**This app makes a real network call** to `jsonplaceholder.typicode.com/todos?userId=1&_limit=10`.
Beyond the mocked test suite, I ran the thunk directly against the live endpoint outside any
mock — dispatching `fetchTodos()` against a real store, with a local todo already added,
returned the actual 10 JSONPlaceholder todos for user 1, correctly tagged `source: 'api'`,
sitting alongside the untouched local todo. That run is summarized below rather than repeated
here in full.

## File map

```
src/
  app/store.js
  features/todos/todosSlice.js       addTodo/removeTodo/toggleTodo/setTodos + loading/error
  features/todos/thunks.js           fetchTodos
  features/todos/selectors.js
  features/todos/todosSlice.test.js  reducer tests
  features/todos/thunks.test.js      thunk tests against a mocked fetch
  components/TodoList.jsx            the required list component; fetches on mount
  components/AddTodo.jsx
  components/ToggleTodo.jsx          one per row
  components/RemoveTodo.jsx          one per row
```

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | Store with thunk middleware | `app/store.js` |
| 2 | `addTodo`, `removeTodo`, `toggleTodo`, `setTodos` | `todosSlice.js` |
| 3 | Thunk fetching from a mock API, dispatching into the slice | `thunks.js` |
| 4 | `TodoList`, `AddTodo`, `ToggleTodo`, `RemoveTodo` components | `components/` |
| 5 | `useSelector` + `useDispatch` wiring | all four components |
| 6 | Add / toggle / remove / fetch tests | `todosSlice.test.js`, `thunks.test.js` |

## Decisions worth explaining

**`ToggleTodo` and `RemoveTodo` are per-row components, not standalone global controls.** The
instructions describe them as components that "toggle the completion status of todos" / "remove
todos from the Redux store," which reads two ways: a single global control (e.g. "type an id to
remove"), or a small reusable component rendered once per todo. The per-row reading is both more
idiomatic React and the only one that doesn't require typing an id by hand to remove a todo you
can already see — so `TodoList` renders one `ToggleTodo` and one `RemoveTodo` per line, each
receiving that row's todo (or id) as a prop and dispatching independently.

**`setTodos` doesn't just replace `state.items`.** "Set" sounds like "replace everything," but a
literal replace would mean fetching (or re-fetching via the "Refresh from source" button) silently
discards any todos added locally first. Every todo carries a `source: 'local' | 'api'` tag;
`setTodos` replaces only the previously-fetched batch and leaves local todos alone. The reducer
test asserts this directly — add one locally, fetch, re-fetch with different results, and confirm
the local todo survived all of it while the stale fetched batch didn't linger.

**Local and fetched todos can't collide on id without the `source` tag either, for what it's
worth** — locally-added todos get a `nanoid()` string id, fetched todos keep JSONPlaceholder's
numeric id, and the two id spaces never overlap. The `source` field is there for clarity and to
make the merge logic legible, not because it's the only thing preventing a collision.

**The API's shape gets narrowed before it's dispatched, not after.** JSONPlaceholder returns
`{ userId, id, title, completed }`; the thunk maps that down to `{ id, title, completed }` before
calling `setTodos`, so every todo in state has the same shape regardless of where it came from —
`TodoList` never needs to branch on origin when rendering a row.

**Same middleware note as the previous exercise:** `configureStore` already includes thunk by
default; there's no `redux-thunk` package to install for `dispatch(fetchTodos())` to work.

## Validating it

**Reducers** (`todosSlice.test.js`, 7 tests): `addTodo` generating a local id and tag,
`toggleTodo` / `removeTodo` affecting only the matching todo, and the `setTodos` merge behavior
described above, tested through an actual add → fetch → re-fetch sequence rather than asserted
in isolation.

**Thunk** (`thunks.test.js`, 5 tests): `fetch` is mocked with `vi.stubGlobal`, dispatched against
a real `configureStore` instance. Covered: the API-shape-to-app-shape mapping, that a local todo
survives a fetch, a non-ok response producing `failed` with the item list untouched, a rejected
`fetch` promise (network failure) producing `failed`, and the exact request URL including the
`userId` filter and `_limit`.

**Beyond the suite:** the unmocked run mentioned above confirms the mocked tests aren't just
validating my own mock — `jsonplaceholder.typicode.com` really does return 10 items for
`?userId=1&_limit=10`, and the merge behavior holds against the real response, not just a
hand-built fixture shaped to make the test pass.

## What's stubbed rather than built out

There's no editing of existing todo text, and no de-duplication if the same fetch is triggered
twice in quick succession (unlike the previous exercise, this thunk doesn't take an
`AbortSignal` — a fast double-click on "Refresh from source" will fire two overlapping requests,
and whichever resolves last wins). Todos also aren't persisted between page loads.
