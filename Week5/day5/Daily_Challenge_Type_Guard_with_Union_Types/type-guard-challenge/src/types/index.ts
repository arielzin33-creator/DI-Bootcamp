// src/types/index.ts
//
// Each type carries a literal `type` field ('user' | 'product' | 'order').
// That literal is what makes DataItem a *discriminated* union: TypeScript
// can narrow `item: DataItem` down to a specific member just by checking
// `item.type`, which is exactly what the guards in guards/typeGuards.ts do.

export type User = {
  type: 'user';
  name: string;
  age: number;
};

export type Product = {
  type: 'product';
  id: number;
  price: number;
};

export type Order = {
  type: 'order';
  orderId: string;
  amount: number;
};

export type DataItem = User | Product | Order;
