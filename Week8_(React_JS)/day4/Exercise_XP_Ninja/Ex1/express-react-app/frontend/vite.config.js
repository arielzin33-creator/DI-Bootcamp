import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // Vite's equivalent of Create React App's package.json "proxy" key:
  // any request the app makes to /users is forwarded to the Express
  // backend on port 3001, so the browser never sees a cross-origin
  // request (and no CORS setup is needed on the Express side).
  server: {
    proxy: {
      "/users": "http://localhost:3001",
    },
  },
});
