import { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import AppHeader from "./components/AppHeader";
import WeatherPage from "./pages/WeatherPage";
import FavoritesPage from "./pages/FavoritesPage";
import { useAppStore } from "./store/useAppStore";
import { buildTheme } from "./theme/muiTheme";

export default function App() {
  const themeMode = useAppStore((state) => state.themeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppHeader />
      <Routes>
        <Route path="/" element={<WeatherPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
