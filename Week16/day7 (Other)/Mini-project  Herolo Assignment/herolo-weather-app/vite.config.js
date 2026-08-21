import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built assets resolve correctly whether this is served
// from a GitHub Pages project subpath (https://user.github.io/repo-name/) or
// from the root of any other static host.
export default defineConfig({
  plugins: [react()],
  base: "./",
})
