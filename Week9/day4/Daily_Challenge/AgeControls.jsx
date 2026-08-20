import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ageUpAsync, ageDownAsync, ageReset } from '../features/age/ageSlice';
import { selectAgeLoading, selectAge } from '../features/age/selectors';

export default function AgeControls() {
  const dispatch = useDispatch();
  const loading = useSelector(selectAgeLoading);
  const age = useSelector(selectAge);

  const handleAgeUp = useCallback(() => dispatch(ageUpAsync()), [dispatch]);
  const handleAgeDown = useCallback(() => dispatch(ageDownAsync()), [dispatch]);
  const handleReset = useCallback(() => dispatch(ageReset()), [dispatch]);

  // Both buttons are disabled during a request, not just the one that was
  // clicked — the slice tracks a single shared `loading` flag (as the
  // exercise's state shape asks for), so firing the second thunk mid-flight
  // would just queue up a second, overlapping delay rather than doing
  // anything useful.
  return (
    <form className="controls" onSubmit={(e) => e.preventDefault()}>
      <button
        type="button"
        className="controls__button controls__button--down"
        onClick={handleAgeDown}
        disabled={loading || age === 0}
      >
        Age down
      </button>
      <button
        type="button"
        className="controls__button controls__button--up"
        onClick={handleAgeUp}
        disabled={loading}
      >
        Age up
      </button>
      <button type="button" className="controls__reset" onClick={handleReset} disabled={loading}>
        Reset
      </button>
    </form>
  );
}
