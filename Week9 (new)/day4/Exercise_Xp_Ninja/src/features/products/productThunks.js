import {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
} from './productSlice'

// Thunk action creator: fetches product data from a public mock e-commerce
// API and stores the result in the product slice.
export function fetchProducts() {
  return async function (dispatch) {
    dispatch(fetchProductsStart())

    try {
      const response = await fetch('https://fakestoreapi.com/products?limit=8')

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      dispatch(fetchProductsSuccess(data))
    } catch (err) {
      dispatch(fetchProductsFailure(err.message))
    }
  }
}
