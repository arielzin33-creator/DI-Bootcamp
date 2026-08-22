import { createSelector } from '@reduxjs/toolkit'

const selectProductsState = (state) => state.cart.products
const selectCartState = (state) => state.cart.cart

export const selectProducts = createSelector([selectProductsState], (products) => products)

// Joins the raw cart entries (productId + quantity) with the product
// catalog to produce display-ready cart items with a computed subtotal.
export const selectCartItems = createSelector(
  [selectCartState, selectProductsState],
  (cart, products) =>
    cart.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        ...product,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      }
    })
)

export const calculateTotalPrice = createSelector([selectCartItems], (cartItems) =>
  cartItems.reduce((total, item) => total + item.subtotal, 0)
)
