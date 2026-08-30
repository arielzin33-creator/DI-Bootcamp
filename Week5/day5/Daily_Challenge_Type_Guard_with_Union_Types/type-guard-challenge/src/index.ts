// src/index.ts
//
// Demonstrates handleData against a well-typed mixed array, and then
// against a deliberately malformed item to show the runtime fallback.

import { DataItem } from './types';
import { handleData } from './handleData';

const data: DataItem[] = [
  { type: 'user', name: 'Alice', age: 29 },
  { type: 'product', id: 101, price: 49.99 },
  { type: 'order', orderId: 'ORD-2024-001', amount: 149.97 },
  { type: 'user', name: 'Bob', age: 34 },
];

console.log('--- Well-typed data ---');
handleData(data).forEach((message) => console.log(message));

// Simulating data from an untyped source (e.g. JSON.parse on an API
// response) that doesn't actually match any known `type` discriminant.
// The `as unknown as DataItem[]` cast is intentionally unsafe here —
// it exists only to demonstrate that processItem's runtime fallback
// (in handleData.ts) still produces a message instead of throwing.
const malformedData = [
  { type: 'coupon', code: 'SAVE10' },
] as unknown as DataItem[];

console.log('');
console.log('--- Malformed / unexpected data ---');
handleData(malformedData).forEach((message) => console.log(message));
