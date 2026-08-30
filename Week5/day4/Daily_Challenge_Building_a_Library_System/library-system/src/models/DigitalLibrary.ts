// src/models/DigitalLibrary.ts
//
// Extends Library (basic inheritance) with a `readonly` property that
// can only be set once, in the constructor, and never reassigned
// afterwards — and a `listBooks` method built on top of the inherited,
// protected `getAllBooks()` accessor.

import { Library } from './Library';

export class DigitalLibrary extends Library {
  public readonly website: string;

  constructor(website: string) {
    super();
    this.website = website;
  }

  /**
   * Returns the titles of every book currently in the library.
   */
  public listBooks(): string[] {
    return this.getAllBooks().map((book) => book.title);
  }
}
