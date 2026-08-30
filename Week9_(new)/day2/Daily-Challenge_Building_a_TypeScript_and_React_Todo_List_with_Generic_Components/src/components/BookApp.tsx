import { useState, type FormEvent } from 'react'
import type { Book } from '../types/Book'
import List from './List'

const INITIAL_BOOKS: Book[] = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien' },
  { id: 2, title: 'Dune', author: 'Frank Herbert' },
  { id: 3, title: '1984', author: 'George Orwell' },
]

function BookApp() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  const addBook = (title: string, author: string): void => {
    const newBook: Book = {
      id: Date.now(),
      title,
      author,
    }
    setBooks((prev) => [...prev, newBook])
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (!title.trim() || !author.trim()) return

    addBook(title.trim(), author.trim())
    setTitle('')
    setAuthor('')
  }

  return (
    <div className="book-app">
      <h1>Book List</h1>

      <form className="add-book-form" onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button type="submit">Add Book</button>
      </form>

      <List<Book>
        items={books}
        keyExtractor={(book) => book.id}
        renderItem={(book) => (
          <>
            <strong>{book.title}</strong> by {book.author}
          </>
        )}
      />
    </div>
  )
}

export default BookApp
