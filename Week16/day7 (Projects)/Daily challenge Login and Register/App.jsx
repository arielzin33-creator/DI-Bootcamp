import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navigation from './components/Navigation';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css';

// The brief says "you can use App.js for the Dashboard" — the dashboard view lives
// directly in App below rather than a separate file, since it's small and this is
// the component that already owns the logged-in `user` state it needs to display.
function Dashboard({ user }) {
  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>
      <p>You're logged in as {user.email}.</p>
      <p className="dashboard__joined">
        Member since {new Date(user.joined).toLocaleDateString()}
      </p>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  function handleLogout() {
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Navigation user={user} onLogout={handleLogout} />
      <main className="page">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/register"
            element={
              user ? <Navigate to="/dashboard" replace /> : <RegisterForm onAuth={setUser} />
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginForm onAuth={setUser} />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
