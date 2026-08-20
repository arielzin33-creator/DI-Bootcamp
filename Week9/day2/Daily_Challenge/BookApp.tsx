import { useState } from 'react';
import type { Book } from './Book';
import List from './List';

const initialBooks: Book[] = [
  { id: crypto.randomUUID(), title: 'Pride and Prejudice', author: 'Jane Austen' },
  { id: crypto.randomUUID(), title: 'Beloved', author: 'Toni Morrison' },
  { id: crypto.randomUUID(), title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez' },
];

function createBook(title: string, author: string): Book {
  return { id: crypto.randomUUID(), title, author };
}

export default function BookApp() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const addBook = () => {
    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();
    if (!trimmedTitle || !trimmedAuthor) return;

    setBooks((previousBooks) => [...previousBooks, createBook(trimmedTitle, trimmedAuthor)]);
    setTitle('');
    setAuthor('');
  };

  return (
    <div className="book-app">
      <h1>Book List</h1>

      <div className="add-book">
        <input
          placeholder="Title"
          aria-label="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Author"
          aria-label="Book author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button type="button" onClick={addBook}>
          Add book
        </button>
      </div>

      <List
        items={books}
        keyExtractor={(book) => book.id}
        renderItem={(book) => (
          <span>
            <strong>{book.title}</strong> by {book.author}
          </span>
        )}
      />
    </div>
  );
}
