import { useSelector } from 'react-redux';
import { selectProducts, selectTotalUnits, selectLowStockCount } from '../features/inventory/selectors';
import UpdateQuantity from './UpdateQuantity';
import RemoveProduct from './RemoveProduct';

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryList() {
  const products = useSelector(selectProducts);
  const totalUnits = useSelector(selectTotalUnits);
  const lowStockCount = useSelector(selectLowStockCount);

  return (
    <section className="shelf" aria-label="Inventory">
      <header className="shelf__head">
        <h2 className="shelf__title">On the shelf</h2>
        <div className="shelf__stats">
          <span>{totalUnits} units total</span>
          {lowStockCount > 0 && <span className="shelf__warning">{lowStockCount} low stock</span>}
        </div>
      </header>

      {products.length === 0 ? (
        <p className="shelf__empty">No products in inventory.</p>
      ) : (
        <ul className="bins">
          {products.map((product) => {
            const isOut = product.quantity === 0;
            const isLow = !isOut && product.quantity <= LOW_STOCK_THRESHOLD;
            return (
              <li
                key={product.id}
                className={`bin-card${isOut ? ' bin-card--out' : ''}${isLow ? ' bin-card--low' : ''}`}
              >
                <div className="bin-card__tab" aria-hidden="true" />
                <p className="bin-card__name">{product.name}</p>
                <UpdateQuantity product={product} />
                {isOut && <span className="bin-card__flag">Out of stock</span>}
                {isLow && <span className="bin-card__flag">Low stock</span>}
                <RemoveProduct productId={product.id} label={product.name} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
