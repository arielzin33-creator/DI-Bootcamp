import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import productReducer from './features/products/productSlice'
import cartReducer from './features/cart/cartSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
  },
  // getDefaultMiddleware() already includes redux-thunk, which powers the
  // thunk action creators in authThunks.js and productThunks.js.
})
