import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginUser } from '../api/authApi';

function LoginForm({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const { ok, data } = await loginUser({ email, password });

    setSubmitting(false);

    if (!ok) {
      // Same "not registered" message whether the email doesn't exist or the password
      // is wrong — the server deliberately doesn't distinguish the two, so this just
      // surfaces exactly what it sent.
      setError(data.error || 'Login failed. Please try again.');
      return;
    }

    onAuth(data.user);
    navigate('/dashboard');
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign In</h2>

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="auth-form__error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

export default LoginForm;
