import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  products: [
    { id: nanoid(), name: 'Widget', quantity: 12 },
    { id: nanoid(), name: 'Gadget', quantity: 5 },
    { id: nanoid(), name: 'Gizmo', quantity: 0 },
  ],
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addProduct: {
      reducer(state, action) {
        state.products.push(action.payload)
      },
      prepare(name, quantity) {
        return { payload: { id: nanoid(), name, quantity } }
      },
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload
      const product = state.products.find((p) => p.id === id)
      if (product) {
        product.quantity = Math.max(0, quantity)
      }
    },
    removeProduct(state, action) {
      state.products = state.products.filter((p) => p.id !== action.payload)
    },
  },
})

export const { addProduct, updateQuantity, removeProduct } = inventorySlice.actions
export default inventorySlice.reducer
