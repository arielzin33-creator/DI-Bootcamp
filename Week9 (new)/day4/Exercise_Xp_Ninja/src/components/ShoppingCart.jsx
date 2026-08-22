import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice'

function ShoppingCart() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>

      {items.length === 0 ? (
        <p className="status-message">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} />
                <div className="cart-item-details">
                  <p className="cart-item-title">{item.title}</p>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                    }
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="remove-item"
                  onClick={() => dispatch(removeFromCart(item.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-footer">
            <span className="cart-total">Total: ${total.toFixed(2)}</span>
            <button type="button" onClick={() => dispatch(clearCart())}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ShoppingCart
