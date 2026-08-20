import { createSelector } from '@reduxjs/toolkit';

export const selectProducts = (state) => state.shop.products;

/** Raw cart lines: `{ productId, quantity }[]`, no product details joined in. */
export const selectCartItems = (state) => state.shop.cart;

/**
 * `{ productId: product }` lookup, built once per change to the catalogue.
 * The catalogue never actually changes after startup in this exercise, so
 * this selector effectively runs once for the app's whole lifetime — but the
 * pattern is the point: every other selector below needs to look up a
 * product by id at least once per cart line, and a map lookup is O(1)
 * against a list `.find()` that is O(n). Build the map once, reuse it,
 * rather than scanning the product list again inside a `.map()` over the
 * cart.
 */
const selectProductsById = createSelector([selectProducts], (products) =>
  products.reduce((byId, product) => {
    byId[product.id] = product;
    return byId;
  }, {}),
);

/**
 * Cart lines joined with product name, unit, price, and a computed subtotal.
 * This is what the cart UI actually renders — components read this instead
 * of combining `selectCartItems` and `selectProducts` themselves, so the
 * join logic exists in exactly one place.
 */
export const selectCartDetails = createSelector(
  [selectCartItems, selectProductsById],
  (cartItems, productsById) =>
    cartItems.map((item) => {
      const product = productsById[item.productId];
      const price = product?.price ?? 0;
      return {
        productId: item.productId,
        name: product?.name ?? 'Unknown item',
        unit: product?.unit ?? '',
        quantity: item.quantity,
        price,
        subtotal: price * item.quantity,
      };
    }),
);

/**
 * Total price across the cart.
 *
 * Floating-point addition of decimal currency values accumulates small
 * rounding error (`0.1 + 0.2 !== 0.3`), so the running sum is rounded to the
 * nearest cent at the end. A production system handling real money should
 * go further and store prices as integer cents throughout rather than
 * rounding a float after the fact — this rounding step is a reasonable
 * safeguard for a display total, not a substitute for that.
 */
export const calculateTotalPrice = createSelector([selectCartDetails], (details) => {
  const rawTotal = details.reduce((sum, item) => sum + item.subtotal, 0);
  return Math.round(rawTotal * 100) / 100;
});

/** Total unit count across all lines — e.g. "5 items" in a cart badge. */
export const selectCartItemCount = createSelector([selectCartItems], (cartItems) =>
  cartItems.reduce((count, item) => count + item.quantity, 0),
);

/**
 * How many units of one specific product are already in the cart.
 *
 * Same factory pattern as `selectTasksByCategory` and `selectCategoryById`
 * in the earlier exercises, for the same reason: this is called once per
 * rendered `ProductCard`, each with a different `productId`, so a single
 * shared instance would thrash Reselect's one-entry cache. Each ProductCard
 * builds its own instance with `useMemo(makeSelectQuantityInCart, [])`.
 *
 * Note the distinction between "the selector recomputed" and "the component
 * re-rendered": adding an item to the cart changes the `cart` array
 * reference, so this selector's cache misses and its function body runs
 * again for *every* product — but `.find()?.quantity ?? 0` returns the same
 * number for every product whose own line didn't change. `useSelector`
 * compares that returned number with `===`, so only the one ProductCard
 * whose quantity actually changed re-renders. Recomputation happens
 * per-product; re-rendering happens only where the output actually differs.
 */
export const makeSelectQuantityInCart = () =>
  createSelector(
    [selectCartItems, (state, productId) => productId],
    (cartItems, productId) => cartItems.find((item) => item.productId === productId)?.quantity ?? 0,
  );

export const selectQuantityInCart = makeSelectQuantityInCart();
