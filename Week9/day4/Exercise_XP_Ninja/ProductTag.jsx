import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { itemAddedToCart } from '../features/cart/cartSlice';

function ProductTag({ product, canAddToCart }) {
  const dispatch = useDispatch();

  const handleAdd = useCallback(() => dispatch(itemAddedToCart(product)), [dispatch, product]);

  return (
    <li className="tag">
      <span className="tag__hole" aria-hidden="true" />
      <p className="tag__category">{product.category}</p>
      <p className="tag__title">{product.title}</p>
      <p className="tag__price">${product.price.toFixed(2)}</p>
      <button
        type="button"
        className="tag__add"
        onClick={handleAdd}
        disabled={!canAddToCart}
        title={canAddToCart ? undefined : 'Log in to add items to your cart'}
      >
        {canAddToCart ? 'Add to cart' : 'Log in to buy'}
      </button>
    </li>
  );
}

export default memo(ProductTag);
