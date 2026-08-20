import { createSelector } from '@reduxjs/toolkit';

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export const selectIsAuthenticated = createSelector([selectAuthUser], (user) => user !== null);
