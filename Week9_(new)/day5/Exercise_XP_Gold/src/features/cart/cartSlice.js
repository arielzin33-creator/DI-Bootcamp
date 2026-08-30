import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  products: [
    { id: 'p1', name: 'Wireless Mouse', price: 19.99 },
    { id: 'p2', name: 'Mechanical Keyboard', price: 59.99 },
    { id: 'p3', name: 'USB-C Hub', price: 24.5 },
    { id: 'p4', name: 'Laptop Stand', price: 32.0 },
    { id: 'p5', name: 'Webcam', price: 45.75 },
  ],
  cart: [], // { productId, quantity }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const productId = action.payload
      const existing = state.cart.find((item) => item.productId === productId)

      if (existing) {
        existing.quantity += 1
      } else {
        state.cart.push({ productId, quantity: 1 })
      }
    },
  },
})

export const { addToCart } = cartSlice.actions
export default cartSlice.reducer
