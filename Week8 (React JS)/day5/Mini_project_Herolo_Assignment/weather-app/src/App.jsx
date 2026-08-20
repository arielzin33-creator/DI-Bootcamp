import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "./components/Header.jsx";
import WeatherPage from "./pages/WeatherPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import { useApp } from "./context/AppContext.jsx";

export default function App() {
  const { state } = useApp();

  // Rebuilding the MUI theme whenever the stored theme mode changes is
  // how the dark/light toggle bonus is implemented: everything under
  // ThemeProvider (all MUI components) re-themes automatically.
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: state.theme,
          primary: { main: "#3f51b5" },
        },
        shape: { borderRadius: 8 },
      }),
    [state.theme]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Routes>
        <Route path="/" element={<WeatherPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </ThemeProvider>
  );
}
