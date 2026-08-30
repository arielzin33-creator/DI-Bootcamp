# Type Guard Challenge

A small TypeScript project demonstrating user-defined type guards over a
discriminated union (`User | Product | Order`), per the daily challenge
brief.

## Setup

```bash
npm install
npm run build   # compiles src/ -> dist/ with tsc
npm start       # runs dist/index.js
```

Or run directly from TypeScript source (no separate build step, via
`ts-node`):

```bash
npm install
npm run dev
```

## File structure

```
type-guard-challenge/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── types/
    │   └── index.ts        # User, Product, Order, and the DataItem union
    ├── guards/
    │   └── typeGuards.ts   # isUser, isProduct, isOrder
    ├── handleData.ts       # handleData + the per-item branching logic
    └── index.ts             # demo script
```

## How each requirement is implemented

**Types** (`src/types/index.ts`)
`User`, `Product`, and `Order` each carry a literal `type` field
(`'user'`, `'product'`, `'order'`), which makes `DataItem = User |
Product | Order` a *discriminated* union — TypeScript can narrow a
`DataItem` down to one specific member just from an `item.type ===
'...'` check.

**Type guards** (`src/guards/typeGuards.ts`)
`isUser`, `isProduct`, and `isOrder` are user-defined type guards
(return type `item is X`). Once one of these returns `true` inside an
`if`, the compiler treats `item` as that specific type for the rest of
the branch, so `item.name`, `item.price`, `item.orderId`, etc. are all
accessed without any type assertion.

**`handleData`** (`src/handleData.ts`)
Maps over the array and, per item:
- `User` → a greeting with name and age.
- `Product` → a message with the product ID and price.
- `Order` → an order summary with ID and amount.

**"Handles unexpected cases gracefully"** is addressed on two levels,
both exercised in `src/index.ts`:
1. *Compile time* — after the three guards, TypeScript narrows the
   remaining type to `never`. Assigning it to a `never`-typed variable
   is an exhaustiveness check: if a fourth member is ever added to the
   `DataItem` union without a corresponding guard/branch, this file
   stops compiling rather than silently mishandling the new case.
2. *Run time* — data can arrive from an untyped source (an API
   response, `JSON.parse`) and not actually match any known `type`,
   despite the `DataItem[]` signature. Rather than throwing, the
   fallback branch returns a descriptive string. `index.ts`
   demonstrates this with a deliberately malformed item cast via `as
   unknown as DataItem[]`.

## Verification

This was checked with actual tool runs, not just visual inspection:
- `tsc --noEmit` (strict mode) — zero type errors on the shipped code.
- Compiled and ran with Node — output for both the well-typed array and
  the malformed item matched expectations (see below).
- The exhaustiveness check was separately validated in a scratch copy
  of the project by adding a fourth union member (`Refund`) with no
  matching guard: `tsc` correctly failed with `error TS2322: Type
  'Refund' is not assignable to type 'never'`. That scratch copy was
  discarded — it is not part of this deliverable.

Expected output of `npm start`:

```
--- Well-typed data ---
Hello, Alice! You are 29 years old.
Product #101 is priced at $49.99.
Order ORD-2024-001: total amount is $149.97.
Hello, Bob! You are 34 years old.

--- Malformed / unexpected data ---
Unrecognized data item: {"type":"coupon","code":"SAVE10"}
```

## Notes and limitations

- `handleData` returns an array of strings rather than printing
  directly, so it can be tested or reused independently of `console.log`
  (the demo script in `index.ts` handles the printing).
- The malformed-data example is deliberately constructed with an unsafe
  cast (`as unknown as DataItem[]`) purely to demonstrate the runtime
  fallback; ordinary, correctly-typed call sites will never take that
  path at compile time.
