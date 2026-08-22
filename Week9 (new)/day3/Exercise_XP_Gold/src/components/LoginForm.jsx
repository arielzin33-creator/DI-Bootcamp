import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../features/auth/authSlice'

function LoginForm() {
  const dispatch = useDispatch()
  const error = useSelector((state) => state.auth.error)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(loginUser({ username, password }))
  }

  return (
    <div className="login-form">
      <h1>Log In</h1>
      <p className="hint">Try username "demo" and password "password123".</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Log In</button>
      </form>

      {error && <p className="status-message error">{error}</p>}
    </div>
  )
}

export default LoginForm
