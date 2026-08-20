/**
 * Daily Challenge: BookApp
 *
 * This component demonstrates:
 * - useState<Book[]> managing a prepopulated array of books.
 * - addBook building a new Book (with a unique id via crypto.randomUUID())
 *   and appending it through the functional form of the state setter, so
 *   the update is always based on the latest state.
 * - List<Book> instantiated explicitly with the Book type, passing a
 *   renderItem function that knows exactly how a Book should look — while
 *   List itself stays completely generic.
 */

import { useState } from 'react';
import List from './List';
import type { Book } from '../types/book';

const initialBooks: Book[] = [
  { id: crypto.randomUUID(), title: 'Dune', author: 'Frank Herbert' },
  { id: crypto.randomUUID(), title: 'Neuromancer', author: 'William Gibson' },
  { id: crypto.randomUUID(), title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin' },
];

function BookApp() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');

  const addBook = (): void => {
    if (!title.trim() || !author.trim()) return;

    const newBook: Book = {
      id: crypto.randomUUID(),
      title: title.trim(),
      author: author.trim(),
    };

    setBooks((prevBooks) => [...prevBooks, newBook]);
    setTitle('');
    setAuthor('');
  };

  return (
    <div className="card">
      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor="book-title">Title</label>
          <input
            id="book-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="book-author">Author</label>
          <input
            id="book-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </div>
        <button type="button" onClick={addBook}>
          Add book
        </button>
      </div>

      <List<Book>
        items={books}
        renderItem={(book) => (
          <>
            <strong>{book.title}</strong> — {book.author}
          </>
        )}
        emptyMessage="No books yet — add one above."
      />
    </div>
  );
}

export default BookApp;
