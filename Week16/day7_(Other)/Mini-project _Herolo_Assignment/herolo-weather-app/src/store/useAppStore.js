import { create } from "zustand";
import { persist } from "zustand/middleware";

// Central app state (favorites, unit/theme preferences, currently selected
// location). Favorites/unit/theme persist to localStorage via zustand's
// `persist` middleware (see `partialize` below); `selectedLocation` deliberately
// does NOT persist — the spec requires Tel Aviv as the default on load, so each
// fresh session starts from scratch and WeatherPage decides the initial
// location (geolocation first, falling back to Tel Aviv).
export const useAppStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      unit: "C",
      themeMode: "light",
      selectedLocation: null,

      setSelectedLocation: (location) => set({ selectedLocation: location }),

      toggleUnit: () => set((state) => ({ unit: state.unit === "C" ? "F" : "C" })),

      toggleTheme: () =>
        set((state) => ({ themeMode: state.themeMode === "light" ? "dark" : "light" })),

      isFavorite: (key) => get().favorites.some((fav) => fav.key === key),

      addFavorite: (location) =>
        set((state) =>
          state.favorites.some((fav) => fav.key === location.key)
            ? state
            : { favorites: [...state.favorites, location] }
        ),

      removeFavorite: (key) =>
        set((state) => ({ favorites: state.favorites.filter((fav) => fav.key !== key) })),

      toggleFavorite: (location) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(location.key)) {
          removeFavorite(location.key);
        } else {
          addFavorite(location);
        }
      },
    }),
    {
      name: "herolo-weather-app",
      partialize: (state) => ({
        favorites: state.favorites,
        unit: state.unit,
        themeMode: state.themeMode,
      }),
    }
  )
);
