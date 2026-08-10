/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Vitest configuration for server-side unit tests.
 * WHY       Unit-only by decision. Tests must run without a database or a
 *           network call, so the suite stays fast enough to run constantly.
 * ─────────────────────────────────────────────────────────────
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    coverage: { include: ['services/**'], reporter: ['text'] },
  },
});
