import React, { createContext, useContext, useState } from "react";

/**
 * 1. Theme context
 * Holds the current theme value ("light" | "dark") and a function
 * to toggle between the two. Consumers read this via useContext
 * instead of having the theme passed down as props at every level.
 */
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

// Convenience hook so consumers don't need to import ThemeContext directly.
function useTheme() {
  return useContext(ThemeContext);
}

/**
 * 2. Theme provider
 * Wraps the app, owns the piece of state, and exposes it (plus the
 * toggle function) through context.
 */
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 3. Theme switcher component
 * A single button that reads the current theme and the toggle
 * function from context, and flips the theme on click.
 */
function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} style={styles.button(theme)}>
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}

/**
 * 4. A component that consumes the theme to style itself.
 * Any number of components anywhere in the tree can do this,
 * without any prop drilling.
 */
function ThemedCard() {
  const { theme } = useTheme();

  return (
    <div style={styles.card(theme)}>
      <h2 style={{ margin: "0 0 8px" }}>Current theme: {theme}</h2>
      <p style={{ margin: 0 }}>
        This card reads the theme from context via <code>useContext</code>{" "}
        and updates its own styles accordingly.
      </p>
    </div>
  );
}

/**
 * Root app: wraps everything in the provider once, at the top.
 */
export default function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}

function Page() {
  const { theme } = useTheme();

  return (
    <div style={styles.page(theme)}>
      <ThemeSwitcher />
      <ThemedCard />
    </div>
  );
}

// Plain inline style objects keyed by theme, kept at the bottom so the
// component logic above stays easy to read.
const styles = {
  page: (theme) => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    padding: "40px 20px",
    fontFamily: "sans-serif",
    backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e",
    color: theme === "light" ? "#1e1e1e" : "#f5f5f5",
    transition: "background-color 0.2s ease, color 0.2s ease",
  }),
  button: (theme) => ({
    padding: "10px 18px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid",
    borderColor: theme === "light" ? "#1e1e1e" : "#f5f5f5",
    backgroundColor: theme === "light" ? "#1e1e1e" : "#f5f5f5",
    color: theme === "light" ? "#ffffff" : "#1e1e1e",
    cursor: "pointer",
  }),
  card: (theme) => ({
    maxWidth: "420px",
    padding: "20px",
    borderRadius: "8px",
    border: `1px solid ${theme === "light" ? "#d0d0d0" : "#444"}`,
    backgroundColor: theme === "light" ? "#f7f7f7" : "#2a2a2a",
  }),
};
