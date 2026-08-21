import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { clearAuthError, login } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import ErrorAlert from "../components/ErrorAlert";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { accessToken, status, error, fieldErrors } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Already logged in? Go straight to wherever they were headed.
  if (accessToken) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    dispatch(login({ email: email.trim(), password }));
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card bg-base-200 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Welcome back</h1>
          <p className="text-sm opacity-70">Log in to keep writing.</p>

          <ErrorAlert
            message={error}
            fieldErrors={fieldErrors}
            onDismiss={() => dispatch(clearAuthError())}
          />

          <form onSubmit={handleSubmit} className="space-y-3 mt-2" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text">Password</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input input-bordered w-full"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            No account?{" "}
            <Link to="/signup" className="link link-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
