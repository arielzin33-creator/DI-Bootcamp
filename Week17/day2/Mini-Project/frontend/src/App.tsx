import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { bootstrapSession } from "./features/auth/authSlice";
import { useAppDispatch } from "./app/hooks";
import Navbar from "./app/components/Navbar";
import ProtectedRoute from "./app/components/ProtectedRoute";
import HomePage from "./app/pages/HomePage";
import LoginPage from "./app/pages/LoginPage";
import ProfilePage from "./app/pages/ProfilePage";
import SharedStoryPage from "./app/pages/SharedStoryPage";
import SignupPage from "./app/pages/SignupPage";
import StoryViewerPage from "./app/pages/StoryViewerPage";

export default function App() {
  const dispatch = useAppDispatch();

  /**
   * Runs once on mount. The access token lived only in memory, so a page reload lost
   * it -- this trades the httpOnly refresh cookie for a new one, which is what keeps
   * the user logged in across reloads without ever putting a token in localStorage.
   */
  useEffect(() => {
    void dispatch(bootstrapSession());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Public: a share link must work without an account. */}
        <Route path="/shared/:token" element={<SharedStoryPage />} />

        {/* Everything below requires a session. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories/:id" element={<StoryViewerPage />} />
          <Route path="/users/:id" element={<ProfilePage />} />
        </Route>

        <Route
          path="*"
          element={<p className="p-8 text-center text-lg">That page doesn&apos;t exist.</p>}
        />
      </Routes>
    </div>
  );
}
