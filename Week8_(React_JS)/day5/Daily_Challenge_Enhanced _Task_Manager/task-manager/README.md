# Task Manager

A small React application for tracking tasks, extended with task editing
and completion-status filtering. It uses `useContext` and `useReducer`
for global state, and `useRef` for the inline task-editing input.

## Setup

This project follows the standard `create-react-app` structure. To run
it locally:

```bash
npx create-react-app task-manager
```

Then replace the generated `src/` folder with the `src/` folder provided
here (and merge `package.json` if you added extra dependencies), or copy
these files directly into a fresh CRA project. No additional npm
packages beyond `react`, `react-dom`, and `react-scripts` are required.

```bash
cd task-manager
npm install
npm start
```

The app runs at `http://localhost:3000`.

## File structure

```
task-manager/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── TaskContext.js      # createContext + useReducer, exposes useTasks()
│   ├── reducer/
│   │   └── taskReducer.js      # ADD_TASK, TOGGLE_TASK, DELETE_TASK, EDIT_TASK, SET_FILTER
│   ├── components/
│   │   ├── TaskForm.js         # add a new task
│   │   ├── TaskItem.js         # single task row; edit mode uses useRef
│   │   ├── TaskList.js         # filters tasks by state.filter and renders them
│   │   └── FilterButtons.js    # All / Active / Completed controls
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## How the required features are implemented

**State management (`useContext` + `useReducer`)**
`TaskContext.js` creates a single reducer with `useReducer(taskReducer,
initialState)` and shares `{ tasks, filter, dispatch }` through
`TaskContext.Provider`. Any component can read state or dispatch actions
via the `useTasks()` hook, without prop drilling.

**Editing tasks (`useRef`)**
In `TaskItem.js`, clicking "Edit" swaps the task's text for an
uncontrolled `<input>` (`defaultValue`, not `value`). A `useRef` hook
(`inputRef`) is attached to that input. Keystrokes do not trigger
re-renders; the current text is only read from `inputRef.current.value`
when the user clicks "Save" or presses Enter, at which point
`EDIT_TASK` is dispatched with the new text. This matches the "use a
ref to track the edited task text before saving" pattern from the
assignment. A companion `useEffect` calls `inputRef.current.focus()`
when edit mode is activated.

**Filtering tasks**
`FilterButtons.js` dispatches `SET_FILTER` with `'all' | 'active' |
'completed'`. `TaskList.js` derives the visible tasks from
`state.tasks` and `state.filter` on every render (conditional
rendering), rather than keeping a second, duplicated list in state.

**Reducer actions**
`taskReducer.js` implements six action types:
`ADD_TASK`, `TOGGLE_TASK`, `DELETE_TASK` (carried over from the base
exercise), plus `EDIT_TASK` and `SET_FILTER`, added for this exercise.

## Notes and limitations

- Task IDs use `crypto.randomUUID()` when available, falling back to
  `Date.now().toString()` in environments without it.
- State is in-memory only; refreshing the page clears all tasks. Adding
  persistence (e.g. `localStorage`) was outside the scope of this
  exercise but would be a natural next step.
