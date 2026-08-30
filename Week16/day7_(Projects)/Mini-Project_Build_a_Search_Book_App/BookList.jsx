import BookCard from './BookCard';

function BookList({ books }) {
  if (books.length === 0) {
    return <p className="book-list__empty">No books to show. Try a search above.</p>;
  }

  return (
    <div className="book-list">
      {books.map((book) => (
        // Google Books ids are stable and unique per volume — safe as a React key,
        // unlike using the array index, which would misbehave once the list re-sorts.
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default BookList;
