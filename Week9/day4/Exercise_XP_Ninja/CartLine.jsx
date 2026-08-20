import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { itemQuantityChanged, itemRemovedFromCart } from '../features/cart/cartSlice';

function CartLine({ item }) {
  const dispatch = useDispatch();

  const handleQuantityChange = useCallback(
    (event) => {
      const quantity = Number(event.target.value);
      if (Number.isNaN(quantity)) return;
      dispatch(itemQuantityChanged({ productId: item.productId, quantity }));
    },
    [dispatch, item.productId],
  );

  const handleRemove = useCallback(
    () => dispatch(itemRemovedFromCart(item.productId)),
    [dispatch, item.productId],
  );

  return (
    <li className="basket-line">
      <span className="basket-line__title">{item.title}</span>
      <input
        type="number"
        min="1"
        className="basket-line__qty"
        value={item.quantity}
        onChange={handleQuantityChange}
        aria-label={`Quantity for ${item.title}`}
      />
      <span className="basket-line__subtotal">${(item.price * item.quantity).toFixed(2)}</span>
      <button
        type="button"
        className="basket-line__remove"
        onClick={handleRemove}
        aria-label={`Remove ${item.title} from cart`}
      >
        ×
      </button>
    </li>
  );
}

export default memo(CartLine);
