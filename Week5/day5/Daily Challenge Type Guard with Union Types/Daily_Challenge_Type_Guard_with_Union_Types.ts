//Daily Challenge: Type Guard with Union Types

// ============================
// Type Definitions
// ============================

type User = {
  type: 'user';
  name: string;
  age: number;
};

type Product = {
  type: 'product';
  id: number;
  price: number;
};

type Order = {
  type: 'order';
  orderId: string;
  amount: number;
};

type DataItem = User | Product | Order;

// ============================
// Type Guards
// ============================

// Each guard uses the discriminant property 'type' to narrow the union
function isUser(item: DataItem): item is User {
  return item.type === 'user';
}

function isProduct(item: DataItem): item is Product {
  return item.type === 'product';
}

function isOrder(item: DataItem): item is Order {
  return item.type === 'order';
}

// ============================
// Main Function
// ============================

function handleData(items: DataItem[]): string[] {
  const results: string[] = [];

  items.forEach(item => {
    if (isUser(item)) {
      results.push(`Hello, ${item.name}! You are ${item.age} years old.`);
    } else if (isProduct(item)) {
      results.push(`Product #${item.id} is priced at $${item.price.toFixed(2)}.`);
    } else if (isOrder(item)) {
      results.push(`Order ${item.orderId} has a total amount of $${item.amount.toFixed(2)}.`);
    } else {
      // Defensive fallback for unexpected/malformed data
      results.push(`Unrecognized data structure: ${JSON.stringify(item)}`);
    }
  });

  return results;
}

// ============================
// Demonstration
// ============================

const mixedData: DataItem[] = [
  { type: 'user', name: 'Sofia Almeida', age: 29 },
  { type: 'product', id: 501, price: 19.99 },
  { type: 'order', orderId: 'ORD-2026-0042', amount: 145.50 },
  { type: 'user', name: 'Tariq Osman', age: 34 },
  { type: 'product', id: 502, price: 89.0 }
];

const summaries = handleData(mixedData);
summaries.forEach(summary => console.log(summary));

// Output:
// Hello, Sofia Almeida! You are 29 years old.
// Product #501 is priced at $19.99.
// Order ORD-2026-0042 has a total amount of $145.50.
// Hello, Tariq Osman! You are 34 years old.
// Product #502 is priced at $89.00.