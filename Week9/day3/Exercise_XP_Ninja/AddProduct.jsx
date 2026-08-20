import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct } from '../features/inventory/inventorySlice';

export default function AddProduct() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('0');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch(addProduct(trimmed, Number(quantity) || 0));
    setName('');
    setQuantity('0');
  };

  return (
    <form className="add-product" onSubmit={handleSubmit}>
      <input
        className="add-product__name"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="New product name"
      />
      <input
        type="number"
        min="0"
        className="add-product__qty"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        aria-label="Starting quantity"
      />
      <button type="submit" className="add-product__submit">
        Add to stock
      </button>
    </form>
  );
}
