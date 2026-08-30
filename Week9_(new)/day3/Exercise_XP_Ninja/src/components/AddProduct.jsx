import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addProduct } from '../features/inventory/inventorySlice'

function AddProduct() {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const parsedQuantity = parseInt(quantity, 10)

    if (!trimmedName || Number.isNaN(parsedQuantity)) return

    dispatch(addProduct(trimmedName, Math.max(0, parsedQuantity)))
    setName('')
    setQuantity('')
  }

  return (
    <form className="add-product" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Quantity"
        min="0"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button type="submit">Add Product</button>
    </form>
  )
}

export default AddProduct
