import { createSlice } from '@reduxjs/toolkit';

/**
 * The exercise describes a single piece of state — "products and an empty
 * cart array" — rather than two independently-evolving domains the way the
 * tasks/categories exercise did. One slice, two fields, matches that: the
 * catalogue is fixed reference data seeded at startup, and only `cart`
 * actually changes at runtime.
 */
const initialState = {
  products: [
    { id: 'p1', name: 'Brass paper clips', unit: 'box of 100', price: 3.5 },
    { id: 'p2', name: 'Waxed cotton twine', unit: '50m spool', price: 6.0 },
    { id: 'p3', name: 'Kraft mailing labels', unit: 'sheet of 24', price: 2.25 },
    { id: 'p4', name: "Carpenter's pencil", unit: 'each', price: 1.1 },
    { id: 'p5', name: 'Canvas tool roll', unit: 'each', price: 18.0 },
    { id: 'p6', name: 'Beeswax candles', unit: 'pair', price: 9.5 },
    { id: 'p7', name: 'Enamel camp mug', unit: 'each', price: 7.25 },
    { id: 'p8', name: 'Cedar matchbox', unit: 'box of 50', price: 2.75 },
  ],
  /** @type {{ productId: string, quantity: number }[]} */
  cart: [],
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    /** Adds one unit of a product, or increments the existing line by one. */
    itemAddedToCart(state, action) {
      const productId = action.payload;
      const line = state.cart.find((item) => item.productId === productId);
      if (line) {
        line.quantity += 1;
      } else {
        state.cart.push({ productId, quantity: 1 });
      }
    },
    itemQuantityIncremented(state, action) {
      const line = state.cart.find((item) => item.productId === action.payload);
      if (line) line.quantity += 1;
    },
    itemQuantityDecremented(state, action) {
      const line = state.cart.find((item) => item.productId === action.payload);
      if (!line) return;
      line.quantity -= 1;
      if (line.quantity <= 0) {
        state.cart = state.cart.filter((item) => item.productId !== action.payload);
      }
    },
    itemRemovedFromCart(state, action) {
      state.cart = state.cart.filter((item) => item.productId !== action.payload);
    },
    cartCleared(state) {
      state.cart = [];
    },
  },
});

export const {
  itemAddedToCart,
  itemQuantityIncremented,
  itemQuantityDecremented,
  itemRemovedFromCart,
  cartCleared,
} = shopSlice.actions;
export default shopSlice.reducer;
