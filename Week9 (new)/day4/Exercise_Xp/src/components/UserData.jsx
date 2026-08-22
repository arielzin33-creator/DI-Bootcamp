import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../features/user/userSlice'

function UserData() {
  const dispatch = useDispatch()
  const { data, status, error } = useSelector((state) => state.user)

  return (
    <div className="user-data">
      <h1>User Data</h1>

      <div className="actions">
        <button type="button" onClick={() => dispatch(fetchUser(1))} disabled={status === 'loading'}>
          Fetch User #1
        </button>
        <button
          type="button"
          onClick={() => dispatch(fetchUser(9999))}
          disabled={status === 'loading'}
        >
          Simulate Failed Fetch
        </button>
      </div>

      {status === 'idle' && <p className="status-message">Click a button to fetch a user.</p>}
      {status === 'loading' && <p className="status-message">Loading user data…</p>}
      {status === 'failed' && <p className="status-message error">Error: {error}</p>}

      {status === 'succeeded' && data && (
        <div className="user-card">
          <h2>{data.name}</h2>
          <p>Username: {data.username}</p>
          <p>Email: {data.email}</p>
          <p>Phone: {data.phone}</p>
          <p>Company: {data.company?.name}</p>
          <p>
            City: {data.address?.city}
          </p>
        </div>
      )}
    </div>
  )
}

export default UserData
