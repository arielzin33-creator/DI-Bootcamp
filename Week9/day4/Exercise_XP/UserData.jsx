import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserStatus, selectUserError, selectUserDisplayInfo } from '../features/user/selectors';
import { fetchUser } from '../features/user/thunks';
import { userCleared } from '../features/user/userSlice';
import IdBadge from './IdBadge';

const USER_IDS = Array.from({ length: 10 }, (_, i) => i + 1);
const FORCE_ERROR_ID = 999; // JSONPlaceholder only has users 1-10, so this always 404s.

export default function UserData() {
  const dispatch = useDispatch();
  const status = useSelector(selectUserStatus);
  const error = useSelector(selectUserError);
  const user = useSelector(selectUserDisplayInfo);

  const [selectedId, setSelectedId] = useState(1);

  const handleLoad = useCallback(
    (id, signal) => {
      dispatch(fetchUser(id, { signal }));
    },
    [dispatch],
  );

  // Fetch on mount, and again whenever `selectedId` changes. The
  // AbortController means switching from user 3 to user 4 quickly cancels
  // the still-in-flight request for user 3 rather than risking it resolving
  // second and overwriting user 4's data on screen.
  useEffect(() => {
    const controller = new AbortController();
    handleLoad(selectedId, controller.signal);
    return () => controller.abort();
  }, [selectedId, handleLoad]);

  const handleRetry = useCallback(() => {
    handleLoad(selectedId);
  }, [handleLoad, selectedId]);

  const handleClear = useCallback(() => dispatch(userCleared()), [dispatch]);

  return (
    <div className="panel">
      <IdBadge status={status} error={error} user={user} />

      <div className="controls">
        <label className="controls__label" htmlFor="user-id">
          Look up record
        </label>
        <select
          id="user-id"
          className="controls__select"
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {USER_IDS.map((id) => (
            <option key={id} value={id}>
              User #{id}
            </option>
          ))}
          <option value={FORCE_ERROR_ID}>User #{FORCE_ERROR_ID} (forces a 404)</option>
        </select>

        {status === 'failed' && (
          <button type="button" className="controls__retry" onClick={handleRetry}>
            Retry
          </button>
        )}
        <button type="button" className="controls__clear" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
