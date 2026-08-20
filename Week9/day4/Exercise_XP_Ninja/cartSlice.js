import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // { productId, title, price, quantity }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Takes the full product object (from the product slice) so the cart
     * line has its own copy of `title`/`price` at the moment it was added,
     * rather than storing only an id and looking the rest up elsewhere
     * every time the cart renders.
     */
    itemAddedToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
        });
      }
    },
    itemRemovedFromCart(state, action) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    /** Sets an exact quantity (from a number input), clamped to at least 1. */
    itemQuantityChanged(state, action) {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (item) item.quantity = Math.max(1, quantity);
    },
    cartCleared(state) {
      state.items = [];
    },
  },
});

export const { itemAddedToCart, itemRemovedFromCart, itemQuantityChanged, cartCleared } =
  cartSlice.actions;
export default cartSlice.reducer;
