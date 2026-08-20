import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';

export default function Logout() {
  const dispatch = useDispatch();

  return (
    <button type="button" className="logout" onClick={() => dispatch(logoutUser())}>
      Leave the club
    </button>
  );
}
