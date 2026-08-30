// src/guards/typeGuards.ts
//
// User-defined type guards. Each has a return type of the form
// `item is X`, which tells the compiler — not just at this call site,
// but for every subsequent line in the same branch — that `item` is
// narrowed to `X`. handleData.ts relies on this narrowing to access
// type-specific fields (e.g. `item.name`) without a cast.

import { DataItem, User, Product, Order } from '../types';

export function isUser(item: DataItem): item is User {
  return item.type === 'user';
}

export function isProduct(item: DataItem): item is Product {
  return item.type === 'product';
}

export function isOrder(item: DataItem): item is Order {
  return item.type === 'order';
}
