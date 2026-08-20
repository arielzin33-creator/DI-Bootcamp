import { createSelector } from '@reduxjs/toolkit';

/** Plain function — returns the array unchanged, nothing to memoise. */
export const selectProducts = (state) => state.inventory.items;

/**
 * Unlike `selectProducts` above, this one actually derives something —
 * a sum across every product — so it's worth wrapping in `createSelector`:
 * without it, this reduction would re-run on every render regardless of
 * whether the inventory changed. This is the same distinction drawn in the
 * two previous "basic" exercises in this series (todo list, user auth),
 * just landing on the other side of it: a plain lookup doesn't need
 * memoising, but a computed total does.
 */
export const selectTotalUnits = createSelector([selectProducts], (products) =>
  products.reduce((sum, product) => sum + product.quantity, 0),
);

export const selectLowStockCount = createSelector(
  [selectProducts],
  (products) => products.filter((product) => product.quantity > 0 && product.quantity <= 5).length,
);
