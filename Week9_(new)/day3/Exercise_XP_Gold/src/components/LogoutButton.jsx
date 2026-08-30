import { useDispatch } from 'react-redux'
import { logoutUser } from '../features/auth/authSlice'

function LogoutButton() {
  const dispatch = useDispatch()

  return (
    <button type="button" className="logout-button" onClick={() => dispatch(logoutUser())}>
      Log Out
    </button>
  )
}

export default LogoutButton
