import { createSlice, nanoid } from '@reduxjs/toolkit';
import { todayKey } from './dateUtils';

const today = todayKey();

const initialState = {
  /** @type {Record<string, { id: string, text: string }[]>} */
  tasksByDate: {
    [today]: [{ id: 'seed-1', text: 'Try out the daily planner' }],
  },
  selectedDate: today,
};

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    dateSelected(state, action) {
      state.selectedDate = action.payload;
    },
    addTask: {
      reducer(state, action) {
        const { date, id, text } = action.payload;
        if (!state.tasksByDate[date]) state.tasksByDate[date] = [];
        state.tasksByDate[date].push({ id, text });
      },
      // ID generation is a side effect and doesn't belong in the reducer
      // body, which needs to stay a pure function of its arguments.
      prepare(date, text) {
        return { payload: { date, id: nanoid(), text } };
      },
    },
    editTask(state, action) {
      const { date, id, text } = action.payload;
      const tasks = state.tasksByDate[date];
      if (!tasks) return;
      const task = tasks.find((t) => t.id === id);
      if (task) task.text = text;
    },
    deleteTask(state, action) {
      const { date, id } = action.payload;
      const tasks = state.tasksByDate[date];
      if (!tasks) return;
      state.tasksByDate[date] = tasks.filter((t) => t.id !== id);
    },
  },
});

export const { dateSelected, addTask, editTask, deleteTask } = plannerSlice.actions;
export default plannerSlice.reducer;
