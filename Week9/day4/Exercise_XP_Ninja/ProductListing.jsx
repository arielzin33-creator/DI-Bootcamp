import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectProducts, selectProductsStatus, selectProductsError } from '../features/products/selectors';
import { fetchProducts } from '../features/products/productThunks';
import { selectIsAuthenticated } from '../features/auth/selectors';
import ProductTag from './ProductTag';

export default function ProductListing() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleFetch = useCallback(() => dispatch(fetchProducts()), [dispatch]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <section className="listing" aria-label="Products">
      <div className="listing__head">
        <h2 className="listing__title">On the rack</h2>
        {status === 'loading' && <span className="listing__status">Loading…</span>}
      </div>

      {status === 'failed' && (
        <p className="listing__error" role="alert">
          {error}{' '}
          <button type="button" className="listing__retry" onClick={handleFetch}>
            Retry
          </button>
        </p>
      )}

      {status === 'succeeded' && products.length === 0 && (
        <p className="listing__empty">No products available.</p>
      )}

      <ul className="listing__grid">
        {products.map((product) => (
          <ProductTag key={product.id} product={product} canAddToCart={isAuthenticated} />
        ))}
      </ul>
    </section>
  );
}
