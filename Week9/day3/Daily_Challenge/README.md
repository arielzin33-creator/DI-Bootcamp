# Daily Planner — React-Redux + Redux Toolkit

One slice keyed by date, a month-grid calendar for picking which day to view, and per-task
edit/delete controls scoped to whichever day is currently selected.

## Running it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 22 tests
```

Verified locally with `@reduxjs/toolkit` 2.12.0, `react-redux` 9.3.0,
`@testing-library/react` 16.3.2, React 18.3, Vite 5.4.

## File map

```
src/
  app/store.js
  features/planner/plannerSlice.js       tasksByDate, selectedDate, the four actions
  features/planner/selectors.js
  features/planner/dateUtils.js          local-date keys, month grid, formatting
  features/planner/*.test.js
  components/Calendar.jsx                month grid, day selection, task markers
  components/TaskList.jsx                the required list component
  components/AddTask.jsx
  components/EditTask.jsx                per-task, owns its own display/edit toggle
  components/DeleteTask.jsx              per-task
  components/App.test.jsx                day-switching + CRUD interaction tests
```

## How each instruction is satisfied

| Step | Requirement | Where |
|---|---|---|
| 1 | Store keyed by day | `app/store.js`, `plannerSlice.js` |
| 2 | `addTask`, `editTask`, `deleteTask` reducers | `plannerSlice.js` |
| 3 | Calendar/date picker | `Calendar.jsx` |
| 4 | `TaskList`, `AddTask`, `EditTask`, `DeleteTask` | `components/` |
| 5 | `useSelector` + `useDispatch` wiring | all five components |
| 6 | Display updates with the selected day | `Calendar.jsx` dispatches `dateSelected`; `TaskList` reads `selectTasksForSelectedDate` |

## Decisions worth explaining

**Date keys are built from local calendar fields, not `toISOString()`.** `dateUtils.js` has the
full reasoning, but the short version: `date.toISOString().slice(0, 10)` converts to UTC first,
so anyone west of UTC opening this app in the evening would have "today" silently become
"tomorrow" in the stored key. `toDateKey` builds the string from `getFullYear()` / `getMonth()` /
`getDate()` instead, which reads the date the way the user's own clock does. The test suite
specifically checks a late-evening local time (11:30 PM) to make sure this doesn't regress.

**The calendar's "viewed month" and Redux's `selectedDate` are two different pieces of state,
deliberately.** `Calendar` keeps which month is currently being *browsed* in local component
state, separate from which single day is *selected* in the store. Paging forward to plan next
week shouldn't change which day's tasks are showing in `TaskList` until an actual day is clicked
— if the viewed month and the selected day were the same piece of state, browsing forward would
either fight with the selection or need to reset it, neither of which is what a calendar user
expects.

**`selectTasksForSelectedDate` returns a shared, module-level empty array — not `[]` written
inline — when the selected date has no tasks yet.** `useSelector` compares results with `===`; a
fresh `[]` literal on every call would fail that check on every render regardless of whether
anything actually changed, the same referential-stability problem `createSelector` exists to
solve for `.filter()` elsewhere in this series, just showing up here in a plain lookup with a
fallback instead. The selector test asserts this directly — calling it twice against unchanged
state returns the *same* array reference, not just an equal one.

**`EditTask` owns both the display and the edit form for its own task**, rather than `TaskList`
rendering a separate always-visible text span next to an `EditTask` that only renders a button.
The first draft did exactly that, and it meant the plain text and the edit input could both be
visible at once while editing — a real bug I caught before shipping, not a hypothetical one.
Making `EditTask` responsible for showing *either* the text-plus-Edit-button or the
input-plus-Save-button, never both at once, was the fix.

## Validating it

**Date utilities** (`dateUtils.test.js`, 6 tests): the local-vs-UTC correctness check described
above, padding of single-digit months/days, and that `getMonthGrid` produces complete 7-day weeks
containing every day of the target month exactly once (including a leap-year February).

**Reducers** (`plannerSlice.test.js`, 6 tests): `addTask` creates the date's entry on first use
and keeps different days' task lists independent of each other; `editTask` and `deleteTask` each
affect only the matching task on the matching day and are safe no-ops against a date with no
tasks at all.

**Selectors** (`selectors.test.js`, 4 tests): correct lookup for the selected date, the stable
empty-array behavior above, correct switching when the selected date changes, and
`selectDatesWithTasks` including only dates that actually have at least one task.

**Component interactions** (`App.test.jsx`, 6 tests) — this is the core of Step 6's request:
clicking a different day in the calendar shows that day's tasks and hides the previous day's;
a day with tasks shows the marker dot; adding, editing, and deleting all work through the real
UI; and a combined scenario adds tasks to two different days, switches between them, and confirms
each day's list stayed exactly what it should be throughout — the concrete way to verify that
switching days is not accidentally sharing or leaking task lists between dates.

## What's stubbed rather than built out

There's no persistence between reloads, no way to reorder tasks within a day, and no indicator
distinguishing "no tasks planned" from "still loading" — since everything here is synchronous and
in-memory, that distinction doesn't exist yet. A real version of this app would very likely add
persistence (`localStorage` or a backend) as the next step past this exercise's scope.
