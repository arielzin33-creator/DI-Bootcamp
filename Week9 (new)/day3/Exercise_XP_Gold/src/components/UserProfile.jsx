import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../features/auth/authSlice'
import LogoutButton from './LogoutButton'

function UserProfile() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [displayName, setDisplayName] = useState('')

  const handleUpdateName = (event) => {
    event.preventDefault()
    if (!displayName.trim()) return

    dispatch(setUser({ displayName: displayName.trim() }))
    setDisplayName('')
  }

  return (
    <div className="user-profile">
      <h1>Welcome, {user.displayName}!</h1>
      <p className="hint">You are logged in as "{user.username}".</p>

      <form onSubmit={handleUpdateName}>
        <div className="form-field">
          <label htmlFor="display-name">Update display name</label>
          <input
            id="display-name"
            placeholder="New display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <button type="submit">Save Name</button>
      </form>

      <LogoutButton />
    </div>
  )
}

export default UserProfile
