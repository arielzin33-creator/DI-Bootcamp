import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

const AppContext = createContext(null);

const FAVORITES_KEY = "herolo-weather-favorites";
const THEME_KEY = "herolo-weather-theme";
const UNITS_KEY = "herolo-weather-units";

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const initialState = {
  favorites: loadFromStorage(FAVORITES_KEY, []), // [{ key, name, country }]
  theme: loadFromStorage(THEME_KEY, "light"), // "light" | "dark"
  units: loadFromStorage(UNITS_KEY, "C"), // "C" | "F"
};

function appReducer(state, action) {
  switch (action.type) {
    case "ADD_FAVORITE": {
      const alreadySaved = state.favorites.some(
        (favorite) => favorite.key === action.payload.key
      );
      if (alreadySaved) return state;
      return { ...state, favorites: [...state.favorites, action.payload] };
    }

    case "REMOVE_FAVORITE": {
      return {
        ...state,
        favorites: state.favorites.filter(
          (favorite) => favorite.key !== action.payload.key
        ),
      };
    }

    case "TOGGLE_THEME": {
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    }

    case "TOGGLE_UNITS": {
      return { ...state, units: state.units === "C" ? "F" : "C" };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
  }, [state.favorites]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(state.theme));
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem(UNITS_KEY, JSON.stringify(state.units));
  }, [state.units]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
