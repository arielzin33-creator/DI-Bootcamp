/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Render's static-site "Publish Directory" is set to `dist`.
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    // Component tests need DOM APIs, which Node does not have.
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false, // Tailwind classes are strings to the tests; compiling CSS just slows them down.
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/main.tsx", "**/*.d.ts"],
    },
  },
});
