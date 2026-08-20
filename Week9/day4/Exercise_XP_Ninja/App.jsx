import AuthForm from './components/AuthForm';
import ProductListing from './components/ProductListing';
import ShoppingCart from './components/ShoppingCart';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead__row">
          <div>
            <p className="masthead__eyebrow">redux toolkit · thunks · three slices</p>
            <h1 className="masthead__title">The Corner Shop</h1>
          </div>
          <AuthForm />
        </div>
      </header>

      <main className="layout">
        <ProductListing />
        <ShoppingCart />
      </main>
    </div>
  );
}
