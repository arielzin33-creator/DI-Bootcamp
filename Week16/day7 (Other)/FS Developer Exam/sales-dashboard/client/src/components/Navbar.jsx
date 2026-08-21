import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Sales Dashboard</div>
      <div className="navbar-links">
        <NavLink to="/business" className={({ isActive }) => (isActive ? "active" : "")}>
          My Business
        </NavLink>
        <NavLink to="/meetings" className={({ isActive }) => (isActive ? "active" : "")}>
          Meetings
        </NavLink>
        <NavLink to="/statistics" className={({ isActive }) => (isActive ? "active" : "")}>
          Meeting Statistics
        </NavLink>
      </div>
      <div className="navbar-user">
        <span>{user.username}</span>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
