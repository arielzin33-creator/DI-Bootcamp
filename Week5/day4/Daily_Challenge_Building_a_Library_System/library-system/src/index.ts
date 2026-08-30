// src/index.ts
//
// Demonstrates the library system: creates a DigitalLibrary, adds books,
// prints details looked up by ISBN, and prints the full title list.

import { DigitalLibrary } from './models/DigitalLibrary';
import { Book } from './interfaces/Book';

const library = new DigitalLibrary('https://example-digital-library.org');

const books: Book[] = [
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    publishedYear: 2008,
    genre: 'Software Engineering',
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    publishedYear: 1949,
    genre: 'Dystopian Fiction',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt and David Thomas',
    isbn: '978-0135957059',
    publishedYear: 2019,
    // no genre supplied — exercises the optional `genre` property
  },
];

books.forEach((book) => library.addBook(book));

console.log(`Digital library website: ${library.website}`);
console.log('');

console.log('--- Book details by ISBN ---');
for (const { isbn } of books) {
  const details = library.getBookDetails(isbn);
  if (details) {
    const genreSuffix = details.genre ? ` — ${details.genre}` : '';
    console.log(
      `${details.title} by ${details.author} (${details.publishedYear})${genreSuffix}`
    );
  } else {
    console.log(`No book found for ISBN ${isbn}`);
  }
}

// Looking up an ISBN that was never added, to show the "not found" path.
const missing = library.getBookDetails('000-0000000000');
console.log(
  missing ? missing.title : "\nLookup for an unknown ISBN correctly returned nothing."
);

console.log('');
console.log('--- All book titles ---');
console.log(library.listBooks().join(', '));

// The following would each fail to compile, illustrating the access
// modifiers and readonly property in effect:
//
// library.books;              // Error: 'books' is private
// library.getAllBooks();      // Error: 'getAllBooks' is protected
// library.website = 'https://other.example'; // Error: 'website' is readonly
