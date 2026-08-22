import { useDispatch } from 'react-redux'
import { removeProduct } from '../features/inventory/inventorySlice'

function RemoveProduct({ id }) {
  const dispatch = useDispatch()

  return (
    <button type="button" className="remove-product" onClick={() => dispatch(removeProduct(id))}>
      Remove
    </button>
  )
}

export default RemoveProduct
