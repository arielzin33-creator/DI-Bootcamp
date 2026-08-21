import { extractYear, formatAuthors, getThumbnail } from '../utils/book';

function BookCard({ book }) {
  const { volumeInfo } = book;
  const thumbnail = getThumbnail(volumeInfo.imageLinks);
  const year = extractYear(volumeInfo.publishedDate);

  return (
    <div className="book-card">
      <div className="book-card__cover">
        {thumbnail ? (
          <img src={thumbnail} alt={`Cover of ${volumeInfo.title}`} loading="lazy" />
        ) : (
          // Many books in the API have no cover image at all — a placeholder keeps
          // the grid aligned instead of leaving a broken-image icon or a gap.
          <div className="book-card__cover-placeholder" aria-hidden="true">
            📖
          </div>
        )}
      </div>
      <div className="book-card__info">
        <h3 className="book-card__title">{volumeInfo.title || 'Untitled'}</h3>
        <p className="book-card__author">{formatAuthors(volumeInfo.authors)}</p>
        <p className="book-card__year">{year ?? 'Unknown year'}</p>
      </div>
    </div>
  );
}

export default BookCard;
