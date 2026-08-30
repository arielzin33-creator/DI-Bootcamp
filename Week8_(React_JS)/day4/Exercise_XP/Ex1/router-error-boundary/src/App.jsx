import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ErrorBoundary from "./ErrorBoundary";

function HomeScreen() {
  return <h2>Home</h2>;
}

function ProfileScreen() {
  return <h2>Profile</h2>;
}

function ShopScreen() {
  // Thrown on purpose, to demonstrate the ErrorBoundary catching a
  // render error on this specific route without taking down the rest
  // of the app (Home/Profile stay reachable via the nav).
  throw new Error("Shop screen crashed");
}

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand navbar-light bg-light px-3">
        <div className="navbar-nav">
          {/* `end` is required here: without it, NavLink treats "/" as a
              prefix match and it would stay "active" on every route. */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active fw-bold" : "")
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active fw-bold" : "")
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active fw-bold" : "")
            }
          >
            Shop
          </NavLink>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <HomeScreen />
              </ErrorBoundary>
            }
          />
          <Route
            path="/profile"
            element={
              <ErrorBoundary>
                <ProfileScreen />
              </ErrorBoundary>
            }
          />
          <Route
            path="/shop"
            element={
              <ErrorBoundary>
                <ShopScreen />
              </ErrorBoundary>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
