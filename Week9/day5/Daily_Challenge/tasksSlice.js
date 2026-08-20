import { createSlice, nanoid } from '@reduxjs/toolkit';
import { categoryDeleted } from '../categories/categoriesSlice';

const initialState = {
  items: [
    {
      id: 'task-1',
      title: 'Draft the Q3 planning outline',
      categoryId: 'cat-deep-work',
      notes: '',
      progress: 40,
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Reply to outstanding client emails',
      categoryId: 'cat-admin',
      notes: '',
      progress: 100,
      completed: true,
    },
    {
      id: 'task-3',
      title: 'Read chapter 4 of the design systems book',
      categoryId: 'cat-learning',
      notes: '',
      progress: 20,
      completed: false,
    },
    {
      id: 'task-4',
      title: 'Reconcile last month\u2019s expense report',
      categoryId: 'cat-admin',
      notes: '',
      progress: 0,
      completed: false,
    },
    {
      id: 'task-5',
      title: 'Sketch the onboarding flow revisions',
      categoryId: 'cat-deep-work',
      notes: '',
      progress: 70,
      completed: false,
    },
  ],
};

const clampProgress = (value) => Math.min(100, Math.max(0, value));

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskAdded: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ title, categoryId, notes = '' }) {
        return {
          payload: { id: nanoid(), title, categoryId, notes, progress: 0, completed: false },
        };
      },
    },
    taskEdited(state, action) {
      const { id, changes } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (task) Object.assign(task, changes);
    },
    taskDeleted(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    taskProgressUpdated(state, action) {
      const { id, progress } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (task) task.progress = clampProgress(progress);
    },
    taskCompletedToggled(state, action) {
      const task = state.items.find((t) => t.id === action.payload);
      if (task) task.completed = !task.completed;
    },
  },
  // This slice never dispatches `categoryDeleted` itself, but it needs to
  // react to it: a task pointing at a category that no longer exists is an
  // orphan. `extraReducers` lets the tasks slice listen for an action owned
  // by the categories slice without the two slices importing each other's
  // reducer logic — only the plain action creator crosses the boundary.
  extraReducers: (builder) => {
    builder.addCase(categoryDeleted, (state, action) => {
      const deletedCategoryId = action.payload;
      state.items = state.items.filter((t) => t.categoryId !== deletedCategoryId);
    });
  },
});

export const { taskAdded, taskEdited, taskDeleted, taskProgressUpdated, taskCompletedToggled } =
  tasksSlice.actions;
export default tasksSlice.reducer;
