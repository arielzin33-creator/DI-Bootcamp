import { useDispatch } from 'react-redux';
import { removeProduct } from '../features/inventory/inventorySlice';

export default function RemoveProduct({ productId, label }) {
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      className="bin-card__remove"
      aria-label={`Remove ${label} from inventory`}
      onClick={() => dispatch(removeProduct(productId))}
    >
      Remove
    </button>
  );
}
