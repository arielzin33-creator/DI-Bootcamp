import { productsFetchStarted, productsFetchSucceeded, productsFetchFailed } from './productSlice';

/**
 * The Fake Store API — a public mock API built specifically for practicing
 * e-commerce front ends, purpose-built for exactly this exercise (unlike
 * JSONPlaceholder, which is generic and has no product/price/category
 * data). Verified reachable and returning the expected shape before this
 * was wired up: `curl https://fakestoreapi.com/products?limit=3`.
 */
const PRODUCTS_API_URL = 'https://fakestoreapi.com/products?limit=8';

export function fetchProducts() {
  return async function fetchProductsThunk(dispatch) {
    dispatch(productsFetchStarted());
    try {
      const response = await fetch(PRODUCTS_API_URL);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = await response.json();
      const products = data.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
      }));

      dispatch(productsFetchSucceeded(products));
    } catch (error) {
      dispatch(productsFetchFailed(error.message || 'Something went wrong fetching products.'));
    }
  };
}
