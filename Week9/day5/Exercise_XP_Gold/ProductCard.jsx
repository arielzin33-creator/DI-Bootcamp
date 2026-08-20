import { memo, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { makeSelectQuantityInCart } from '../features/shop/selectors';

/**
 * Wrapped in `memo`. `onAdd` is built once with `useCallback` in
 * ShoppingCart and handed down unchanged, so adding an item to the cart —
 * which re-renders ShoppingCart — does not by itself re-render every
 * ProductCard. Each card still only re-renders when its own `product` prop
 * changes or its own quantity-in-cart selector returns a new number; see
 * the comment on `makeSelectQuantityInCart` for why that stays scoped to
 * this one card instead of cascading to the other seven.
 */
function ProductCard({ product, onAdd }) {
  const selectQuantityInCart = useMemo(makeSelectQuantityInCart, []);
  const quantity = useSelector((state) => selectQuantityInCart(state, product.id));

  const renderCount = useRef(0);
  renderCount.current += 1;

  const handleClick = useCallback(() => onAdd(product.id), [onAdd, product.id]);

  return (
    <li className="product">
      <div className="product__info">
        <p className="product__name">{product.name}</p>
        <p className="product__unit">{product.unit}</p>
      </div>
      <div className="product__buy">
        <span className="product__price">${product.price.toFixed(2)}</span>
        <button type="button" className="product__add" onClick={handleClick}>
          Add
        </button>
      </div>
      {quantity > 0 && <span className="product__badge">{quantity} in cart</span>}
      <span className="product__renders" title="Times this card has rendered">
        r{renderCount.current}
      </span>
    </li>
  );
}

export default memo(ProductCard);
