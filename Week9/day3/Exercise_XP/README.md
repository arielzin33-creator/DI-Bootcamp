# Basic Todo List — React-Redux + Redux Toolkit

The foundational version: one slice, three actions, three components, no filters, no async, no
thunks. Deliberately the simplest project in this series.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 10 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0,
`@testing-library/react` 16.3.2, React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js
  features/todos/todosSlice.js       addTodo, toggleTodo, removeTodo
  features/todos/selectors.js
  features/todos/todosSlice.test.js  reducer tests
  components/TodoList.jsx
  components/AddTodo.jsx
  components/TodoItem.jsx
  components/App.test.jsx            interaction tests, per Step 5
```

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | Slice: `addTodo`, `toggleTodo`, `removeTodo` | `todosSlice.js` |
| 2 | `configureStore` with the slice | `app/store.js` |
| 3 | `TodoList`, `AddTodo`, `TodoItem` | `components/` |
| 4 | `useSelector` + `useDispatch` in each | all three components |
| 5 | Add / complete / remove / overall tests | `todosSlice.test.js`, `App.test.jsx` |

## Decisions worth explaining

**No `memo`, no `useCallback`, no per-component selector factories.** Several earlier, more
advanced exercises in this series lean on that combination deliberately — a memoized child
component paired with a stable dispatch handler, so toggling one row doesn't re-render every
other row. That's worth doing when a list might reasonably grow large or when the exercise names
`useCallback` explicitly. Neither is true here: this exercise doesn't mention it, and a todo list
built for learning the fundamentals doesn't need to optimize for a rendering cost that isn't the
point of the lesson yet. `TodoItem` dispatches directly from inline handlers — the plainest
version that's still correct, which is the right target for an exercise titled "basic."

**`selectTodos` is a plain function, not `createSelector`**, for the same reason `selectBooks`
was in the very first exercise in this series: it returns `state.todos.items` unchanged, with
nothing filtered, mapped, or sorted. There's no new array reference on each call for
`createSelector` to guard against, so wrapping it would add a memoisation layer that does nothing.

**The seed data includes one already-completed todo.** ("Learn Redux Toolkit" ✓, "Build a todo
list" in progress) — mostly so opening the app for the first time shows both visual states
(checked and unchecked) without needing to click anything first.

## Validating it

**Reducers** (`todosSlice.test.js`, 5 tests): adding generates an id and defaults `completed` to
`false`; toggling affects only the matching todo (and flips back on a second toggle); toggling a
nonexistent id is a no-op; removing affects only the matching todo.

**Component interactions** (`App.test.jsx`, 5 tests): this is the first "basic" exercise in the
series to get full end-to-end interaction tests through the real rendered UI rather than just the
reducer — Step 5 literally asks to verify adding/completing/removing "using the AddTodo
component" / "the TodoItem component," which is a UI claim, not just a state claim. Covered:
adding a todo through the form (and the input clearing afterward), rejecting a blank or
whitespace-only submission, toggling a checkbox and seeing both the checkbox's accessible name
and the row's `--done` class change, removing a todo via its own remove button, and a combined
add → complete → remove sequence across two todos to confirm operating on one doesn't disturb
the other.

## What's stubbed rather than built out

There's no editing of existing todo text, no persistence between reloads, and no visibility
filter (all todos always show) — each of those is what the later, more elaborate todo-list
exercise in this series adds on top of this same foundation.
