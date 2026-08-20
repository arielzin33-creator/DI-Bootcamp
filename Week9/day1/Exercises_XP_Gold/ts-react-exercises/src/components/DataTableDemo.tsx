import { useState } from 'react';
import DataTable from './DataTable';
import type { TableColumn } from './DataTable';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: 'Wireless Mouse', category: 'Accessories', price: 25 },
  { id: 2, name: 'Mechanical Keyboard', category: 'Accessories', price: 89 },
  { id: 3, name: '27" Monitor', category: 'Displays', price: 249 },
  { id: 4, name: 'USB-C Hub', category: 'Accessories', price: 39 },
  { id: 5, name: 'Webcam 1080p', category: 'Peripherals', price: 59 },
];

const columns: TableColumn<Product>[] = [
  { key: 'name', title: 'Product', sortable: true },
  { key: 'category', title: 'Category', sortable: true },
  {
    key: 'price',
    title: 'Price',
    sortable: true,
    render: (item) => `$${item.price.toFixed(2)}`,
  },
];

function DataTableDemo() {
  const [selectedCount, setSelectedCount] = useState<number>(0);

  return (
    <div className="card">
      <DataTable<Product>
        data={products}
        columns={columns}
        onSelect={(selected) => setSelectedCount(selected.length)}
      />
      <p className="muted">{selectedCount} row(s) selected</p>
    </div>
  );
}

export default DataTableDemo;
