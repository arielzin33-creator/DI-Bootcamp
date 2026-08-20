import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { id: 'prod-1', name: 'Shipping boxes (small)', quantity: 42 },
    { id: 'prod-2', name: 'Packing tape', quantity: 6 },
    { id: 'prod-3', name: 'Bubble wrap roll', quantity: 0 },
  ],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addProduct: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      // ID generation is a side effect and doesn't belong in the reducer
      // body, which needs to stay a pure function of its arguments.
      prepare(name, quantity = 0) {
        return { payload: { id: nanoid(), name, quantity: Math.max(0, quantity) } };
      },
    },
    /** Sets an exact quantity (from a number input), clamped to at least 0. */
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const product = state.items.find((p) => p.id === id);
      if (product) product.quantity = Math.max(0, quantity);
    },
    removeProduct(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addProduct, updateQuantity, removeProduct } = inventorySlice.actions;
export default inventorySlice.reducer;
