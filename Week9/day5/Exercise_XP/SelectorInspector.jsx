import { useDispatch, useSelector } from 'react-redux';
import { genreSelected } from '../features/books/booksSlice';
import {
  selectSelectedGenre,
  selectHorrorBooks,
  selectFantasyBooks,
  selectScienceFictionBooks,
} from '../features/books/selectors';

const TRACKED = [
  ['selectHorrorBooks', selectHorrorBooks],
  ['selectFantasyBooks', selectFantasyBooks],
  ['selectScienceFictionBooks', selectScienceFictionBooks],
];

// `recomputations()` is part of Reselect's public API, but guard anyway so the
// panel degrades quietly rather than crashing the page on a version bump.
const countOf = (selector) =>
  typeof selector.recomputations === 'function' ? selector.recomputations() : '—';

/**
 * Not part of the exercise brief, but it makes the point of `createSelector`
 * visible: cycle through the genres a few times and watch each counter stop at
 * 1. The result function runs once per selector and every later visit is a
 * cache hit, because `state.books.items` keeps the same reference.
 */
export default function SelectorInspector() {
  const dispatch = useDispatch();
  const selectedGenre = useSelector(selectSelectedGenre);

  return (
    <aside className="inspector">
      <h2 className="inspector__heading">Selector recomputations</h2>
      <dl className="inspector__list">
        {TRACKED.map(([name, selector]) => (
          <div key={name} className="inspector__row">
            <dt>{name}</dt>
            <dd>{countOf(selector)}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        className="inspector__action"
        onClick={() => dispatch(genreSelected(selectedGenre))}
      >
        Dispatch a no-op action
      </button>
      <p className="inspector__note">
        Re-selecting the genre that is already active dispatches a real action but leaves the
        state identical, so nothing above moves.
      </p>
    </aside>
  );
}
