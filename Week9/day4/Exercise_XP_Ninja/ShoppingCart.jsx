import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, selectCartTotal, selectCartItemCount } from '../features/cart/selectors';
import { cartCleared } from '../features/cart/cartSlice';
import CartLine from './CartLine';

export default function ShoppingCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const itemCount = useSelector(selectCartItemCount);

  const handleClear = useCallback(() => dispatch(cartCleared()), [dispatch]);

  return (
    <section className="basket" aria-label="Shopping cart">
      <header className="basket__head">
        <h2 className="basket__title">Basket</h2>
        <span className="basket__count">{itemCount}</span>
      </header>

      {items.length === 0 ? (
        <p className="basket__empty">Your basket is empty.</p>
      ) : (
        <>
          <ul className="basket__lines">
            {items.map((item) => (
              <CartLine key={item.productId} item={item} />
            ))}
          </ul>
          <div className="basket__total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button type="button" className="basket__clear" onClick={handleClear}>
            Clear basket
          </button>
        </>
      )}
    </section>
  );
}
