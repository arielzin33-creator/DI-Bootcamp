import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';

const toDisplayName = (username) => username.charAt(0).toUpperCase() + username.slice(1);

export default function Login() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    dispatch(loginUser({ username: trimmed, name: toDisplayName(trimmed) }));
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <label className="login__label" htmlFor="username">
        Username
      </label>
      <input
        id="username"
        className="login__input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g. ada"
      />
      <button type="submit" className="login__submit">
        Enter
      </button>
    </form>
  );
}
