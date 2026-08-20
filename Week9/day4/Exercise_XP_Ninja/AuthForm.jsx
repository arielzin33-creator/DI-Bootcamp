import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthUser, selectAuthStatus, selectAuthError } from '../features/auth/selectors';
import { simulateLogin } from '../features/auth/authThunks';
import { loggedOut } from '../features/auth/authSlice';

export default function AuthForm() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      dispatch(simulateLogin(username, password));
    },
    [dispatch, username, password],
  );

  const handleLogout = useCallback(() => dispatch(loggedOut()), [dispatch]);

  if (user) {
    return (
      <div className="auth auth--in">
        <span className="auth__greeting">Welcome, {user.name}</span>
        <button type="button" className="auth__logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <form className="auth" onSubmit={handleSubmit}>
      <input
        className="auth__field"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Username"
      />
      <input
        className="auth__field"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
      />
      <button type="submit" className="auth__submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Checking…' : 'Log in'}
      </button>
      {status === 'failed' && (
        <p className="auth__error" role="alert">
          {error}
        </p>
      )}
      <p className="auth__hint">Demo: any username, password is "password".</p>
    </form>
  );
}
