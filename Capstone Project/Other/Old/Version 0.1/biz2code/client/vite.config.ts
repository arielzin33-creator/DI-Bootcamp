/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Vite config. Dev server + API proxy + @ alias.
 * WHY       Proxying /api to :3001 means the browser sees one origin, so the
 *           auth cookie is same-site in development and CORS/SameSite issues
 *           never appear. This saves a predictable hour of debugging.
 * ADR       ADR-005
 * ─────────────────────────────────────────────────────────────
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
