import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, logoutUser } from '../features/auth/authThunks'

function AuthForm() {
  const dispatch = useDispatch()
  const { isAuthenticated, user, error } = useSelector((state) => state.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(login(username, password))
  }

  if (isAuthenticated) {
    return (
      <div className="auth-form authenticated">
        <span>Logged in as {user.username}</span>
        <button type="button" onClick={() => dispatch(logoutUser())}>
          Logout
        </button>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      {error && <span className="auth-error">{error}</span>}
    </form>
  )
}

export default AuthForm
