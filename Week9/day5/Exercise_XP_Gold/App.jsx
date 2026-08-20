import ShoppingCart from './components/ShoppingCart';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__eyebrow">redux · createSelector · useCallback</p>
        <h1 className="masthead__title">No. 4 General Store</h1>
        <p className="masthead__lede">
          One slice holds the catalogue and the cart. Every derived number on the receipt —
          per-line subtotal, the running total, the count in the corner — is a memoised
          selector, not a calculation repeated in the render.
        </p>
      </header>

      <ShoppingCart />
    </div>
  );
}
