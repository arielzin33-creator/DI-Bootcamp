import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../features/cart/cartSlice'
import { selectProducts, selectCartItems, calculateTotalPrice } from '../features/cart/selectors'
import ProductItem from './ProductItem'

function ShoppingCart() {
  const dispatch = useDispatch()
  const products = useSelector(selectProducts)
  const cartItems = useSelector(selectCartItems)
  const totalPrice = useSelector(calculateTotalPrice)

  // A single stable handler shared by every ProductItem: it reads the
  // clicked product's id off the DOM event instead of being re-created
  // per product, so ProductItem's memo() never sees a new `onAdd` identity.
  const handleAddToCart = useCallback(
    (event) => {
      dispatch(addToCart(event.currentTarget.dataset.id))
    },
    [dispatch]
  )

  return (
    <div className="shopping-cart">
      <section>
        <h2>Products</h2>
        <div className="product-grid">
          {products.map((product) => (
            <ProductItem key={product.id} product={product} onAdd={handleAddToCart} />
          ))}
        </div>
      </section>

      <section className="cart-section">
        <h2>Cart</h2>
        {cartItems.length === 0 ? (
          <p className="empty-message">Your cart is empty.</p>
        ) : (
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <span>{item.name}</span>
                <span>× {item.quantity}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="cart-total">Total: ${totalPrice.toFixed(2)}</p>
      </section>
    </div>
  )
}

export default ShoppingCart
