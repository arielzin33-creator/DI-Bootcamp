import { createSelector } from '@reduxjs/toolkit';

export const selectUser = (state) => state.user.data;
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;

/**
 * This exercise is centered on the thunk/reducer lifecycle rather than
 * selector composition, so there isn't much to derive — but consistent
 * with the rest of this series, anything the component would otherwise
 * compute inline lives in a selector instead.
 */
export const selectIsUserLoading = createSelector(
  [selectUserStatus],
  (status) => status === 'loading',
);

/** Trims the raw API payload down to the handful of fields the badge shows. */
export const selectUserDisplayInfo = createSelector([selectUser], (user) =>
  user
    ? {
        name: user.name,
        email: user.email,
        company: user.company?.name ?? '',
        city: user.address?.city ?? '',
      }
    : null,
);
