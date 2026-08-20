import { memo } from 'react';

/**
 * Memoized for the same reason as ProductCard: ShoppingCart passes down
 * stable `useCallback` handlers, so incrementing one line doesn't force
 * every other line in the receipt to re-render.
 */
function CartLine({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <li className="line">
      <div className="line__name-block">
        <span className="line__name">{item.name}</span>
        <span className="line__unit">{item.unit}</span>
      </div>

      <div className="line__qty">
        <button
          type="button"
          className="line__step"
          aria-label={`Remove one ${item.name}`}
          onClick={() => onDecrement(item.productId)}
        >
          −
        </button>
        <span className="line__qty-value">{item.quantity}</span>
        <button
          type="button"
          className="line__step"
          aria-label={`Add one more ${item.name}`}
          onClick={() => onIncrement(item.productId)}
        >
          +
        </button>
      </div>

      <span className="line__leader" aria-hidden="true" />
      <span className="line__subtotal">${item.subtotal.toFixed(2)}</span>

      <button
        type="button"
        className="line__remove"
        aria-label={`Remove ${item.name} from cart`}
        onClick={() => onRemove(item.productId)}
      >
        ×
      </button>
    </li>
  );
}

export default memo(CartLine);
