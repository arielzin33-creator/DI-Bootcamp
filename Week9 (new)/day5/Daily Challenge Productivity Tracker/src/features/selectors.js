import { createSelector } from '@reduxjs/toolkit'

const selectTasksState = (state) => state.tasks.items
const selectCategoriesState = (state) => state.categories.items
const selectCategoryIdArg = (state, categoryId) => categoryId

export const selectCategories = createSelector([selectCategoriesState], (categories) => categories)

// Note: createSelector's default memoization cache holds only the *last*
// call's arguments. Since selectTasksByCategory takes a categoryId argument,
// switching categories back and forth will keep re-filtering (a well-known
// tradeoff of parametrized selectors) — but repeated calls with the SAME
// category (e.g. re-renders while a category stays selected) are memoized.
export const selectTasksByCategory = createSelector(
  [selectTasksState, selectCategoryIdArg],
  (tasks, categoryId) => tasks.filter((task) => task.categoryId === categoryId)
)

export const selectCompletedTasks = createSelector(
  [selectTasksState],
  (tasks) => tasks.filter((task) => task.completed).length
)

export const selectCategoryById = createSelector(
  [selectCategoriesState, selectCategoryIdArg],
  (categories, categoryId) => categories.find((category) => category.id === categoryId)
)
