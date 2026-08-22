import AddProduct from './components/AddProduct'
import InventoryList from './components/InventoryList'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>Store Inventory</h1>
      <AddProduct />
      <InventoryList />
    </div>
  )
}

export default App
