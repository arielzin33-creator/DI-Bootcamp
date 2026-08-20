import { useSelector } from 'react-redux';
import { GENRE_LABELS, ALL_GENRES } from '../features/books/booksSlice';
import { selectVisibleBooks, selectSelectedGenre } from '../features/books/selectors';

function callNumber(book) {
  // A pretend Cutter number, derived from data already in the record.
  const prefix = book.genre.slice(0, 2).toUpperCase();
  const surname = book.author.split(' ').pop().slice(0, 3).toUpperCase();
  return `${prefix} ${book.year} ${surname}`;
}

/**
 * Reads one memoised selector and renders the result. The component never
 * filters, sorts or counts anything itself; if the shape of the inventory
 * changes, only `selectors.js` needs editing.
 */
export default function BookList() {
  const books = useSelector(selectVisibleBooks);
  const selectedGenre = useSelector(selectSelectedGenre);

  const heading =
    selectedGenre === ALL_GENRES ? 'Whole catalogue' : GENRE_LABELS[selectedGenre];

  if (books.length === 0) {
    return (
      <section className="catalogue">
        <h2 className="catalogue__heading">{heading}</h2>
        <p className="catalogue__empty">
          No titles are shelved under this genre yet. Add one to the inventory to see it here.
        </p>
      </section>
    );
  }

  return (
    <section className="catalogue">
      <h2 className="catalogue__heading">
        {heading}
        <span className="catalogue__tally">
          {books.length} {books.length === 1 ? 'title' : 'titles'}
        </span>
      </h2>

      <ul className="cards">
        {books.map((book) => (
          <li key={book.id} className="card">
            <div className="card__spine">
              <span className="card__hole" aria-hidden="true" />
              <span className="card__call">{callNumber(book)}</span>
            </div>
            <div className="card__body">
              <h3 className="card__title">{book.title}</h3>
              <p className="card__author">{book.author}</p>
              <p className="card__meta">
                {GENRE_LABELS[book.genre]} <span aria-hidden="true">·</span> {book.year}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
