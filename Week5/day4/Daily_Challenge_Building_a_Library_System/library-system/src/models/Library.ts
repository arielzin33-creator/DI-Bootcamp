// src/models/Library.ts
//
// Base class for the library system. `books` is private: it can only be
// read or modified through this class's own methods, never accessed
// directly from outside (including from subclasses) — that's the whole
// point of the `private` modifier, as opposed to `protected`.
//
// Subclasses that need read access to the collection (e.g. DigitalLibrary)
// go through the `protected` accessor `getAllBooks()` below, rather than
// reaching into `books` itself.

import { Book } from '../interfaces/Book';

export class Library {
  private books: Book[] = [];

  /**
   * Adds a new book to the library's collection.
   */
  public addBook(book: Book): void {
    this.books.push(book);
  }

  /**
   * Returns the details of a book matching the given ISBN, or `undefined`
   * if no book with that ISBN is in the collection.
   */
  public getBookDetails(isbn: string): Book | undefined {
    return this.books.find((book) => book.isbn === isbn);
  }

  /**
   * Protected accessor for the private `books` array. Available to
   * subclasses (e.g. DigitalLibrary.listBooks), but not to external code.
   */
  protected getAllBooks(): Book[] {
    return this.books;
  }
}
