import AuthForm from './components/AuthForm'
import ProductListing from './components/ProductListing'
import ShoppingCart from './components/ShoppingCart'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Simulated E-Commerce</h1>
        <AuthForm />
      </header>

      <div className="app-body">
        <ProductListing />
        <ShoppingCart />
      </div>
    </div>
  )
}

export default App
