// src/handleData.ts
//
// Processes a mixed array of User | Product | Order, dispatching on
// each item's discriminant via the guards in guards/typeGuards.ts.
//
// "Handles unexpected cases gracefully" is addressed on two levels:
//
//   1. Compile time: after the three `if` guards, TypeScript narrows
//      `item` to `never` (every member of the DataItem union has been
//      ruled out). Assigning it to a `never`-typed variable is a classic
//      exhaustiveness check — if a fourth type is ever added to DataItem
//      without a matching guard here, this file stops compiling instead
//      of silently mishandling the new case.
//
//   2. Run time: data can arrive from an untyped source (JSON.parse,
//      an external API, a cast) and bypass the type system entirely.
//      Rather than throwing or returning `undefined` for such an item,
//      processItem still returns a descriptive string.

import { DataItem } from './types';
import { isUser, isProduct, isOrder } from './guards/typeGuards';

export function handleData(items: DataItem[]): string[] {
  return items.map(processItem);
}

function processItem(item: DataItem): string {
  if (isUser(item)) {
    return `Hello, ${item.name}! You are ${item.age} years old.`;
  }

  if (isProduct(item)) {
    return `Product #${item.id} is priced at $${item.price.toFixed(2)}.`;
  }

  if (isOrder(item)) {
    return `Order ${item.orderId}: total amount is $${item.amount.toFixed(2)}.`;
  }

  // Compile-time exhaustiveness check (see file header).
  const exhaustiveCheck: never = item;

  // Runtime fallback for malformed/unknown data (see file header).
  return `Unrecognized data item: ${JSON.stringify(exhaustiveCheck)}`;
}
