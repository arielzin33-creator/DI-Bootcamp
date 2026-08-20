import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productsFetchStarted(state) {
      state.status = 'loading';
      state.error = null;
    },
    productsFetchSucceeded(state, action) {
      state.status = 'succeeded';
      state.items = action.payload;
      state.error = null;
    },
    productsFetchFailed(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { productsFetchStarted, productsFetchSucceeded, productsFetchFailed } =
  productSlice.actions;
export default productSlice.reducer;
