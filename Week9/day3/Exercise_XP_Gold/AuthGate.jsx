import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../features/auth/selectors';
import Login from './Login';
import Logout from './Logout';
import ProfileEditor from './ProfileEditor';

export default function AuthGate() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  return (
    <div className="gate">
      <div className={`lock${isAuthenticated ? ' lock--open' : ''}`} aria-hidden="true">
        <span className="lock__shackle" />
        <span className="lock__body" />
      </div>

      <div className="card">
        {isAuthenticated ? (
          <div className="card__content">
            <p className="card__eyebrow">Members only</p>
            <h2 className="card__welcome">Welcome, {user.name}</h2>
            <ProfileEditor />
            <Logout />
          </div>
        ) : (
          <div className="card__content">
            <p className="card__eyebrow">Members only</p>
            <h2 className="card__welcome">Please log in</h2>
            <Login />
          </div>
        )}
      </div>
    </div>
  );
}
