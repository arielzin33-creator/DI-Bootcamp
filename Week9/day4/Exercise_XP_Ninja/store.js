import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productReducer from './features/products/productSlice';
import cartReducer from './features/cart/cartSlice';

// `configureStore`'s default middleware already includes thunk — no
// separate `redux-thunk` install or `middleware:` option needed for either
// `simulateLogin` or `fetchProducts` to work with `dispatch`.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
  },
});

export default store;
