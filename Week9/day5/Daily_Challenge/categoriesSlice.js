import { createSlice, nanoid } from '@reduxjs/toolkit';

/** Sentinel meaning "no category filter — show everything". */
export const ALL_CATEGORIES = 'all';

const initialState = {
  items: [
    { id: 'cat-deep-work', name: 'Deep work', color: '#e2a63b' },
    { id: 'cat-admin', name: 'Admin', color: '#e1653d' },
    { id: 'cat-learning', name: 'Learning', color: '#4fa3a0' },
  ],
  selectedCategoryId: ALL_CATEGORIES,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    categoryAdded: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      // ID generation is a side effect (randomness); it belongs in `prepare`,
      // not in the reducer body, which must stay a pure function of its args.
      prepare({ name, color }) {
        return { payload: { id: nanoid(), name, color } };
      },
    },
    categoryEdited(state, action) {
      const { id, changes } = action.payload;
      const category = state.items.find((c) => c.id === id);
      if (category) Object.assign(category, changes);
    },
    categoryDeleted(state, action) {
      const id = action.payload;
      state.items = state.items.filter((c) => c.id !== id);
      // Deleting the category currently being viewed would leave the UI
      // pointed at a filter that no longer exists. Fall back to "All".
      if (state.selectedCategoryId === id) {
        state.selectedCategoryId = ALL_CATEGORIES;
      }
    },
    categorySelected(state, action) {
      state.selectedCategoryId = action.payload;
    },
  },
});

export const { categoryAdded, categoryEdited, categoryDeleted, categorySelected } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
