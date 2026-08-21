import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import { clearCurrent } from "../../features/stories/storiesSlice";
import { disconnectSocket } from "../api/socket";
import { useAppDispatch, useAppSelector } from "../hooks";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  async function handleLogout() {
    // Close the socket before dropping the token -- otherwise it would keep
    // reconnecting with credentials the user just gave up.
    disconnectSocket();
    await dispatch(logout());
    dispatch(clearCurrent());
    navigate("/login", { replace: true });
  }

  return (
    <div className="navbar bg-base-200 shadow-md px-4 sticky top-0 z-30">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-lg sm:text-xl normal-case">
          Storyweave
        </Link>
      </div>

      <div className="flex-none gap-2 items-center">
        <ThemeToggle />
        {user ? (
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm gap-2">
              <Avatar user={user} size="xs" />
              <span className="hidden sm:inline">{user.username}</span>
            </button>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-2 z-40 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="menu-title text-xs opacity-70">{user.email}</li>
              <li>
                <Link to={`/users/${user.id}`}>My profile</Link>
              </li>
              <li>
                <Link to="/">All stories</Link>
              </li>
              <li>
                <button type="button" onClick={handleLogout}>
                  Log out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
