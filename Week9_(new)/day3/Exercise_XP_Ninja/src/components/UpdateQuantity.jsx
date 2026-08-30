import { useDispatch } from 'react-redux'
import { updateQuantity } from '../features/inventory/inventorySlice'

function UpdateQuantity({ id, quantity }) {
  const dispatch = useDispatch()

  const handleChange = (delta) => {
    dispatch(updateQuantity({ id, quantity: quantity + delta }))
  }

  const handleDirectChange = (event) => {
    const value = parseInt(event.target.value, 10)
    if (!Number.isNaN(value)) {
      dispatch(updateQuantity({ id, quantity: value }))
    }
  }

  return (
    <div className="update-quantity">
      <button type="button" onClick={() => handleChange(-1)} disabled={quantity === 0}>
        −
      </button>
      <input type="number" min="0" value={quantity} onChange={handleDirectChange} />
      <button type="button" onClick={() => handleChange(1)}>
        +
      </button>
    </div>
  )
}

export default UpdateQuantity
