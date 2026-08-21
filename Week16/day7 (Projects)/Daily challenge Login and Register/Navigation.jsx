import { Link } from 'react-router-dom';

function Navigation({ user, onLogout }) {
  return (
    <nav className="nav">
      <Link to="/" className="nav__brand">
        AuthApp
      </Link>
      <div className="nav__links">
        {user ? (
          <>
            <span className="nav__greeting">Hi, {user.name}</span>
            <button type="button" className="nav__link nav__link--button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav__link">
              Sign In
            </Link>
            <Link to="/register" className="nav__link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
