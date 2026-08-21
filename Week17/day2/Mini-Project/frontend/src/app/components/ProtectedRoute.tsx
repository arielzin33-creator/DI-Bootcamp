import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks";
import Spinner from "./Spinner";

/**
 * Gate for routes that need a logged-in user.
 *
 * It waits for `initialized` before deciding. Without that wait, a logged-in user
 * reloading the page would be bounced to /login for the split second before the
 * silent refresh finishes -- losing the page they were on.
 *
 * `state={{ from: location }}` lets the login page send them back where they were
 * headed once they authenticate.
 */
export default function ProtectedRoute() {
  const { accessToken, initialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) return <Spinner label="Restoring your session..." />;

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
