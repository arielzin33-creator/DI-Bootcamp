import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectProducts,
  selectCartDetails,
  calculateTotalPrice,
  selectCartItemCount,
} from '../features/shop/selectors';
import {
  itemAddedToCart,
  itemQuantityIncremented,
  itemQuantityDecremented,
  itemRemovedFromCart,
  cartCleared,
} from '../features/shop/shopSlice';
import ProductCard from './ProductCard';
import CartLine from './CartLine';

export default function ShoppingCart() {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);
  const cartDetails = useSelector(selectCartDetails);
  const totalPrice = useSelector(calculateTotalPrice);
  const itemCount = useSelector(selectCartItemCount);

  // One stable callback per action, each taking the changed line's
  // `productId` as an argument, rather than building a fresh closure per
  // product inside the `.map()` below. `ProductCard` and `CartLine` are
  // both `memo`-wrapped; passing a new function reference on every
  // ShoppingCart render would fail their prop comparison regardless of
  // whether the row's own data changed, which defeats the memoisation
  // before it does anything.
  const handleAddToCart = useCallback(
    (productId) => dispatch(itemAddedToCart(productId)),
    [dispatch],
  );
  const handleIncrement = useCallback(
    (productId) => dispatch(itemQuantityIncremented(productId)),
    [dispatch],
  );
  const handleDecrement = useCallback(
    (productId) => dispatch(itemQuantityDecremented(productId)),
    [dispatch],
  );
  const handleRemove = useCallback(
    (productId) => dispatch(itemRemovedFromCart(productId)),
    [dispatch],
  );
  const handleClear = useCallback(() => dispatch(cartCleared()), [dispatch]);

  return (
    <div className="shop">
      <section className="shelf" aria-label="Products">
        <h2 className="shelf__heading">On the shelf</h2>
        <ul className="shelf__list">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
          ))}
        </ul>
      </section>

      <section className="receipt" aria-label="Shopping cart">
        <header className="receipt__head">
          <h2 className="receipt__title">Receipt</h2>
          <span className="receipt__count">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </header>

        {cartDetails.length === 0 ? (
          <p className="receipt__empty">Nothing here yet — add something from the shelf.</p>
        ) : (
          <>
            <ul className="receipt__lines">
              {cartDetails.map((item) => (
                <CartLine
                  key={item.productId}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              ))}
            </ul>

            <div className="receipt__total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <button type="button" className="receipt__clear" onClick={handleClear}>
              Clear cart
            </button>
          </>
        )}

        <div className="receipt__barcode" aria-hidden="true" />
      </section>
    </div>
  );
}
