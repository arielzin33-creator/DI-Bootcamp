/**
 * Light/dark theme, applied via daisyUI's `data-theme` attribute on <html>.
 *
 * The preference is kept in localStorage. Unlike the access token, a theme name is not
 * a secret -- and it genuinely needs to survive a reload, which is exactly what
 * localStorage is for.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeName = "dark" | "light";

const STORAGE_KEY = "storyapp-theme";

function readInitialTheme(): ThemeName {
  // Guarded because localStorage throws in some privacy modes.
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    // No stored preference -> follow the operating system.
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
  } catch {
    /* fall through to the default */
  }
  return "dark"; // the brief asks for dark by default
}

/** Writing the attribute here keeps the DOM in sync without needing a useEffect. */
function applyTheme(theme: ThemeName): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* not fatal -- the theme just won't persist */
  }
}

const initial = readInitialTheme();
applyTheme(initial);

const themeSlice = createSlice({
  name: "theme",
  initialState: { current: initial as ThemeName },
  reducers: {
    setTheme(state, action: PayloadAction<ThemeName>) {
      state.current = action.payload;
      applyTheme(action.payload);
    },
    toggleTheme(state) {
      state.current = state.current === "dark" ? "light" : "dark";
      applyTheme(state.current);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
