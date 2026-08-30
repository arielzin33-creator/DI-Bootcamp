import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import MyBusinessPage from "./pages/MyBusinessPage";
import MeetingsPage from "./pages/MeetingsPage";
import StatisticsPage from "./pages/StatisticsPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/business"
          element={
            <ProtectedRoute>
              <MyBusinessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <MeetingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <StatisticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/business" replace />} />
        <Route path="*" element={<Navigate to="/business" replace />} />
      </Routes>
    </>
  );
}
