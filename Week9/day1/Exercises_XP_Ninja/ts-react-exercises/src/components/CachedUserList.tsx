import useDataFetching from '../hooks/useDataFetching';
import type { User } from '../types/user';

const USERS_URL = 'https://jsonplaceholder.typicode.com/users';
const FIVE_MINUTES_MS = 5 * 60 * 1000;

function CachedUserList() {
  const { data: users, isLoading, error, refetch, invalidateCache } = useDataFetching<User[]>(
    USERS_URL,
    { maxAge: FIVE_MINUTES_MS }
  );

  return (
    <div className="card">
      <div className="button-row">
        <button type="button" onClick={refetch}>
          Refresh
        </button>
        <button type="button" onClick={invalidateCache}>
          Clear cache &amp; refresh
        </button>
      </div>

      {isLoading && <p>Loading users…</p>}
      {error && <p className="error-text">Failed to load users: {error}</p>}

      {!isLoading && !error && users && (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong> — {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CachedUserList;
