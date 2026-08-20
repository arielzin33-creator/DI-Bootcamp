import AddProduct from './components/AddProduct';
import InventoryList from './components/InventoryList';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__eyebrow">redux toolkit · inventory</p>
        <h1 className="masthead__title">Stockroom</h1>
      </header>

      <AddProduct />
      <InventoryList />
    </div>
  );
}
