import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerUser } from '../api/authApi';

function RegisterForm({ onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const { ok, data } = await registerUser({ name, email, password });

    setSubmitting(false);

    if (!ok) {
      // The brief asks specifically for an "already registered" message shown in the
      // form when the email is taken — the server sends exactly that string as
      // data.error for a 400 on a duplicate email, surfaced here as-is.
      setError(data.error || 'Registration failed. Please try again.');
      return;
    }

    onAuth(data.user);
    navigate('/dashboard');
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>

      <label htmlFor="register-name">Name</label>
      <input
        id="register-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="register-password">Password</label>
      <input
        id="register-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />

      {error && <p className="auth-form__error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

export default RegisterForm;
