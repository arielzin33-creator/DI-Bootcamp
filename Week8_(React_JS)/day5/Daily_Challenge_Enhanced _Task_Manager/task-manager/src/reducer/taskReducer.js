// src/reducer/taskReducer.js
//
// Centralized state logic for the Task Manager, consumed via useReducer
// inside TaskContext. Keeping the reducer in its own module (rather than
// inline in the provider) keeps the state-transition logic testable in
// isolation from React.

export const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

export const initialState = {
  tasks: [],
  filter: FILTERS.ALL,
};

export function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      const text = action.payload.text.trim();
      if (!text) return state;

      const newTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text,
        completed: false,
      };

      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'TOGGLE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    }

    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };
    }

    // Added for this exercise: updates the text of an existing task.
    // The new text is read from a ref in TaskItem (see components/TaskItem.js)
    // and dispatched here rather than being tracked in component state.
    case 'EDIT_TASK': {
      const text = action.payload.text.trim();
      if (!text) return state;

      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, text } : task
        ),
      };
    }

    // Added for this exercise: switches which subset of tasks is displayed.
    // The reducer only stores the filter key; TaskList derives the visible
    // list from state.tasks + state.filter on every render.
    case 'SET_FILTER': {
      return { ...state, filter: action.payload.filter };
    }

    default:
      return state;
  }
}
