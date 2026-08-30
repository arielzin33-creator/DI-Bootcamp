# Library System (TypeScript)

A small TypeScript project demonstrating classes, interfaces, access
modifiers, optional/readonly properties, and inheritance, per the daily
challenge brief.

## Setup

```bash
npm install
npm run build   # compiles src/ -> dist/ with tsc
npm start       # runs dist/index.js
```

Or, to run directly from TypeScript source without a separate build
step (uses `ts-node`):

```bash
npm install
npm run dev
```

## File structure

```
library-system/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── interfaces/
    │   └── Book.ts            # Book interface
    ├── models/
    │   ├── Library.ts         # Library class
    │   └── DigitalLibrary.ts  # DigitalLibrary class (extends Library)
    └── index.ts                # demo script
```

## How each requirement is implemented

**`Book` interface** (`src/interfaces/Book.ts`)
`title`, `author`, `isbn`, and `publishedYear` are required; `genre?`
is optional, so a `Book` object can omit it entirely (see the third
book in `index.ts`, which has no genre).

**`Library` class** (`src/models/Library.ts`)
- `private books: Book[]` — inaccessible from outside the class, and
  (deliberately) also inaccessible directly from `DigitalLibrary`,
  since `private` members are not inherited-accessible in TypeScript.
- `public addBook(book: Book): void` — appends to the collection.
- `public getBookDetails(isbn: string): Book | undefined` — looks a
  book up by ISBN; returns `undefined` if there's no match.
- `protected getAllBooks(): Book[]` — an additional accessor (not
  requested explicitly, but necessary) that lets subclasses read the
  collection without making it fully public. This is what
  `DigitalLibrary.listBooks()` uses internally.

**`DigitalLibrary` class** (`src/models/DigitalLibrary.ts`)
- `extends Library` — basic inheritance; it gets `addBook` and
  `getBookDetails` for free.
- `public readonly website: string` — set once in the constructor;
  the TypeScript compiler rejects any later reassignment
  (`lib.website = '...'` fails to compile with error `TS2540`).
- `public listBooks(): string[]` — maps the inherited collection
  (via `getAllBooks()`) to an array of titles.

**Demo** (`src/index.ts`)
Creates a `DigitalLibrary`, adds three books (one without a `genre`,
to exercise the optional property), prints each book's details looked
up by ISBN — including a deliberate lookup of an ISBN that was never
added, to show the "not found" path — and finally prints the full
list of titles via `listBooks()`.

## Verification

Before packaging, this project was type-checked with `tsc --noEmit
--strict` (no errors), compiled and run end-to-end with Node
(output matches the expected book details and title list), and the
access-modifier/readonly rules were separately confirmed to be
enforced: assigning to `website` after construction, and calling the
`protected` `getAllBooks()` from outside the class hierarchy, both
fail to compile with TypeScript errors `TS2540` and `TS2445`
respectively.

## Notes and limitations

- `books` is `private` rather than `protected`, per the brief. This
  means `DigitalLibrary` cannot reach into `this.books` directly —
  hence the `protected getAllBooks()` accessor described above. If a
  stricter reading of the brief is preferred (no accessor beyond what
  was explicitly named), `books` could be changed to `protected`
  instead, and `DigitalLibrary.listBooks()` would then reference it
  directly as `this.books.map(...)`.
- There is no persistence layer (database, file, etc.) — state lives
  only in memory for the duration of the script, which matches the
  scope of the exercise.
