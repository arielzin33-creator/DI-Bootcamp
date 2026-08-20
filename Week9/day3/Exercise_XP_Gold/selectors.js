// Both plain functions, not `createSelector`. Neither filters, maps, sorts,
// or combines anything — they return a field of state unchanged, so there's
// no new reference being created on each call for memoisation to guard
// against. See the basic-todo-list exercise's README for the fuller version
// of this reasoning.
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
