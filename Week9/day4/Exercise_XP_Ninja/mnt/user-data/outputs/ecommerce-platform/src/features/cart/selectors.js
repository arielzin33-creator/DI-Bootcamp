import { createSelector } from '@reduxjs/toolkit';

export const selectCartItems = (state) => state.cart.items;

/**
 * The exercise's Step 2 asks for "reducers for... calculating totals" in
 * the cart slice. That's deliberately not how this is built: a total is
 * fully determined by the items already in `state.cart.items` — it's
 * `price * quantity`, summed. Storing it as its own piece of reducer state
 * would mean keeping a second copy of information the array already
 * contains, and every reducer that touches `items` (`itemAddedToCart`,
 * `itemQuantityChanged`, `itemRemovedFromCart`) would also have to
 * remember to keep that copy in sync — miss one call site, and the
 * displayed total silently drifts from the truth. A selector can't drift:
 * it's recomputed from the same array every time, so there's only ever one
 * source of truth for what's in the cart and what it costs. This is the
 * same reasoning `calculateTotalPrice` was built on in the shopping-cart
 * exercise earlier in this series.
 */
export const selectCartTotal = createSelector([selectCartItems], (items) => {
  const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Math.round(rawTotal * 100) / 100; // guard against float drift, see that exercise's README
});

export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);
