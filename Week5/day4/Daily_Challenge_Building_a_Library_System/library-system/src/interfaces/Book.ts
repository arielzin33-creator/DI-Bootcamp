// src/interfaces/Book.ts
//
// Describes the shape of a book record stored in the library.
// `genre` is optional (`?`), since not every book is catalogued with one.

export interface Book {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre?: string;
}
