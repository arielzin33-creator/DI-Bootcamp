import { useDataFetching } from '../hooks/useDataFetching'

interface User {
  id: number
  name: string
  email: string
  company: {
    name: string
  }
}

const USERS_URL = 'https://jsonplaceholder.typicode.com/users'
const MAX_AGE = 5 * 60 * 1000 // 5 minutes

function UserList() {
  const { data: users, loading, error, fromCache, refetch, invalidateCache } = useDataFetching<User[]>(
    USERS_URL,
    { maxAge: MAX_AGE }
  )

  return (
    <div className="user-list">
      <div className="user-list-actions">
        <button type="button" onClick={refetch}>
          Refresh
        </button>
        <button type="button" onClick={invalidateCache}>
          Clear Cache &amp; Refresh
        </button>
      </div>

      {loading && <p className="status-message">Loading users…</p>}

      {error && (
        <p className="status-message error">
          Error: {error} <button onClick={refetch}>Retry</button>
        </p>
      )}

      {!loading && !error && users && (
        <>
          <p className="cache-indicator">
            {fromCache ? '📦 Served from cache' : '🌐 Freshly fetched from the API'}
          </p>
          <ul>
            {users.map((user) => (
              <li key={user.id} className="user-list-item">
                <strong>{user.name}</strong> — {user.email} ({user.company.name})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default UserList
