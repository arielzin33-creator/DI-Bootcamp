// A plain function, not `createSelector` — it returns `state.todos.items`
// unchanged, with nothing derived from it. Memoising a selector that
// doesn't filter, map, or sort anything wouldn't prevent any re-render
// that isn't already prevented by just reading the array directly; there's
// no new array reference being created here for `createSelector` to guard
// against.
export const selectTodos = (state) => state.todos.items;
