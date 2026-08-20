import { useDispatch } from 'react-redux';
import { updateQuantity } from '../features/inventory/inventorySlice';

export default function UpdateQuantity({ product }) {
  const dispatch = useDispatch();

  const handleChange = (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    dispatch(updateQuantity({ id: product.id, quantity: value }));
  };

  const step = (delta) => {
    dispatch(updateQuantity({ id: product.id, quantity: product.quantity + delta }));
  };

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper__button"
        aria-label={`Decrease quantity of ${product.name}`}
        onClick={() => step(-1)}
        disabled={product.quantity === 0}
      >
        −
      </button>
      <input
        type="number"
        min="0"
        className="stepper__input"
        value={product.quantity}
        onChange={handleChange}
        aria-label={`Quantity for ${product.name}`}
      />
      <button
        type="button"
        className="stepper__button"
        aria-label={`Increase quantity of ${product.name}`}
        onClick={() => step(1)}
      >
        +
      </button>
    </div>
  );
}
