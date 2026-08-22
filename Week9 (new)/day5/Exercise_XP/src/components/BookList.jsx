import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectBooks,
  selectHorrorBooks,
  selectFantasyBooks,
  selectScienceFictionBooks,
  recomputeCounts,
} from '../features/books/selectors'
import { addBook } from '../features/books/booksSlice'

const GENRES = ['All', 'Horror', 'Fantasy', 'Science Fiction']

const EXTRA_BOOKS = [
  ['Salem\'s Lot', 'Stephen King', 'Horror'],
  ['The Fellowship of the Ring', 'J.R.R. Tolkien', 'Fantasy'],
  ['Hyperion', 'Dan Simmons', 'Science Fiction'],
]

function BookList() {
  const dispatch = useDispatch()
  const [activeGenre, setActiveGenre] = useState('All')
  const [extraIndex, setExtraIndex] = useState(0)

  // All four selectors are called on every render regardless of which tab
  // is active. Thanks to createSelector's memoization, switching tabs (a
  // local, non-Redux state change) does NOT re-run the filter functions
  // below — only a genuine change to `books.items` does.
  const allBooks = useSelector(selectBooks)
  const horrorBooks = useSelector(selectHorrorBooks)
  const fantasyBooks = useSelector(selectFantasyBooks)
  const scienceFictionBooks = useSelector(selectScienceFictionBooks)

  const booksByGenre = {
    All: allBooks,
    Horror: horrorBooks,
    Fantasy: fantasyBooks,
    'Science Fiction': scienceFictionBooks,
  }

  const displayedBooks = booksByGenre[activeGenre]

  const handleAddBook = () => {
    const [title, author, genre] = EXTRA_BOOKS[extraIndex % EXTRA_BOOKS.length]
    dispatch(addBook(title, author, genre))
    setExtraIndex((i) => i + 1)
  }

  return (
    <div className="book-list">
      <div className="genre-tabs">
        {GENRES.map((genre) => (
          <button
            key={genre}
            type="button"
            className={genre === activeGenre ? 'active' : ''}
            onClick={() => setActiveGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <ul className="books">
        {displayedBooks.map((book) => (
          <li key={book.id} className="book-card">
            <span className="book-title">{book.title}</span>
            <span className="book-author">by {book.author}</span>
            <span className="book-genre">{book.genre}</span>
          </li>
        ))}
      </ul>

      <div className="memo-panel">
        <h3>Selector recompute counts</h3>
        <p className="memo-hint">
          Switching tabs above re-renders this component but doesn't change the Redux
          state, so these counts stay frozen. Click below to actually change the store
          and watch them increment.
        </p>
        <ul className="memo-counts">
          <li>selectBooks: {recomputeCounts.all}</li>
          <li>selectHorrorBooks: {recomputeCounts.horror}</li>
          <li>selectFantasyBooks: {recomputeCounts.fantasy}</li>
          <li>selectScienceFictionBooks: {recomputeCounts.scienceFiction}</li>
        </ul>
        <button type="button" onClick={handleAddBook}>
          Add a Book (changes Redux state)
        </button>
      </div>
    </div>
  )
}

export default BookList
