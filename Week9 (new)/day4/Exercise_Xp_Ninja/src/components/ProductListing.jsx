import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../features/products/productThunks'
import { addToCart } from '../features/cart/cartSlice'

function ProductListing() {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.products)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <div className="product-listing">
      <div className="product-listing-header">
        <h2>Products</h2>
        <button type="button" onClick={() => dispatch(fetchProducts())} disabled={status === 'loading'}>
          {status === 'loading' ? 'Fetching…' : 'Refresh Products'}
        </button>
      </div>

      {status === 'loading' && <p className="status-message">Loading products…</p>}
      {status === 'failed' && <p className="status-message error">Error: {error}</p>}

      {status === 'succeeded' && (
        <div className="product-grid">
          {items.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.title} />
              <p className="product-title">{product.title}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <button
                type="button"
                disabled={!isAuthenticated}
                onClick={() => dispatch(addToCart(product))}
                title={isAuthenticated ? undefined : 'Log in to add items to your cart'}
              >
                {isAuthenticated ? 'Add to Cart' : 'Log in to buy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductListing
