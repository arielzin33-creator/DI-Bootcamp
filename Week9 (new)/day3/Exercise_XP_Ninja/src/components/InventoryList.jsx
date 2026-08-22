import { useSelector } from 'react-redux'
import UpdateQuantity from './UpdateQuantity'
import RemoveProduct from './RemoveProduct'

function InventoryList() {
  const products = useSelector((state) => state.inventory.products)

  if (products.length === 0) {
    return <p className="empty-message">No products in inventory. Add one above.</p>
  }

  return (
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className={product.quantity === 0 ? 'out-of-stock' : undefined}>
            <td>{product.name}</td>
            <td>
              <UpdateQuantity id={product.id} quantity={product.quantity} />
            </td>
            <td>
              <RemoveProduct id={product.id} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default InventoryList
