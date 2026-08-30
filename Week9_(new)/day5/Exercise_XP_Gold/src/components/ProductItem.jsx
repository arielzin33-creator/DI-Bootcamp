import { memo, useRef } from 'react'

// Wrapped in memo() and given a stable onAdd handler (see ShoppingCart's
// useCallback), so this component only re-renders when its own `product`
// prop changes — never just because the cart or total price updated.
function ProductItem({ product, onAdd }) {
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <div className="product-card">
      <div>
        <span className="product-name">{product.name}</span>
        <span className="product-price">${product.price.toFixed(2)}</span>
      </div>
      <span className="render-count">renders: {renderCount.current}</span>
      <button type="button" data-id={product.id} onClick={onAdd}>
        Add to Cart
      </button>
    </div>
  )
}

export default memo(ProductItem)
