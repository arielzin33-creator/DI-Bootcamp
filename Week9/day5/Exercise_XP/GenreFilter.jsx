import { useDispatch, useSelector } from 'react-redux';
import { GENRES, GENRE_LABELS, ALL_GENRES, genreSelected } from '../features/books/booksSlice';
import { selectSelectedGenre, selectGenreCounts } from '../features/books/selectors';

const OPTIONS = [
  { value: ALL_GENRES, label: 'Whole catalogue' },
  { value: GENRES.HORROR, label: GENRE_LABELS[GENRES.HORROR] },
  { value: GENRES.FANTASY, label: GENRE_LABELS[GENRES.FANTASY] },
  { value: GENRES.SCIENCE_FICTION, label: GENRE_LABELS[GENRES.SCIENCE_FICTION] },
];

/**
 * Presentational + connected: it reads the current genre and dispatches a
 * change. It holds no filtering logic of its own — deciding *which* books
 * match a genre is the selectors' job, not the button's.
 */
export default function GenreFilter() {
  const dispatch = useDispatch();
  const selectedGenre = useSelector(selectSelectedGenre);
  const counts = useSelector(selectGenreCounts);

  return (
    <div className="filter" role="group" aria-label="Filter catalogue by genre">
      {OPTIONS.map(({ value, label }) => {
        const isActive = value === selectedGenre;
        return (
          <button
            key={value}
            type="button"
            className="filter__button"
            aria-pressed={isActive}
            onClick={() => dispatch(genreSelected(value))}
          >
            <span>{label}</span>
            <span className="filter__count">{counts[value]}</span>
          </button>
        );
      })}
    </div>
  );
}
