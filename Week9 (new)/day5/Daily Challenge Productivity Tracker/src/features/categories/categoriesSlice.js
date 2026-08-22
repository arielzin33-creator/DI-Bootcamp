import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: 'work', name: 'Work' },
    { id: 'personal', name: 'Personal' },
    { id: 'learning', name: 'Learning' },
  ],
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: {
      reducer(state, action) {
        state.items.push(action.payload)
      },
      prepare(name) {
        return { payload: { id: nanoid(), name } }
      },
    },
    editCategory(state, action) {
      const { id, name } = action.payload
      const category = state.items.find((c) => c.id === id)
      if (category) {
        category.name = name
      }
    },
    deleteCategory(state, action) {
      state.items = state.items.filter((c) => c.id !== action.payload)
    },
  },
})

export const { addCategory, editCategory, deleteCategory } = categoriesSlice.actions
export default categoriesSlice.reducer
