import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart(state) {
      state.status = 'loading'
      state.error = null
    },
    fetchProductsSuccess(state, action) {
      state.status = 'succeeded'
      state.items = action.payload
    },
    fetchProductsFailure(state, action) {
      state.status = 'failed'
      state.error = action.payload
    },
  },
})

export const { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure } =
  productSlice.actions
export default productSlice.reducer
