import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { clearAuthError, signup } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import ErrorAlert from "../components/ErrorAlert";

const MIN_PASSWORD_LENGTH = 8; // kept in step with the backend's rule

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const { accessToken, status, error, fieldErrors } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  /** Client-side validation, shown before we even hit the network. */
  const [localErrors, setLocalErrors] = useState<Record<string, string> | null>(null);

  // Registering logs the user in immediately (the backend returns a session), so as
  // soon as a token lands we leave for the homepage.
  if (accessToken) return <Navigate to="/" replace />;

  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = "Username is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Email is not valid.";
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Front-end validation is a convenience for the user. The backend re-validates
    // everything regardless -- see backend/src/helpers/validation.ts.
    const errors = validate();
    setLocalErrors(errors);
    if (errors) return;

    dispatch(signup({ username: username.trim(), email: email.trim(), password }));
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card bg-base-200 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Create an account</h1>
          <p className="text-sm opacity-70">Start writing stories with other people.</p>

          <ErrorAlert
            message={error}
            fieldErrors={localErrors ?? fieldErrors}
            onDismiss={() => {
              setLocalErrors(null);
              dispatch(clearAuthError());
            }}
          />

          <form onSubmit={handleSubmit} className="space-y-3 mt-2" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="username">
                <span className="label-text">Username</span>
              </label>
              <input
                id="username"
                className="input input-bordered w-full"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={50}
                required
              />
            </div>

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
                maxLength={100}
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
                autoComplete="new-password"
                className="input input-bordered w-full"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <span className="label-text-alt mt-1 opacity-70">
                At least {MIN_PASSWORD_LENGTH} characters.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
