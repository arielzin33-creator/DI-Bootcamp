/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Tests the gate invariant — the core of the product.
 * WHY       If this passes and everything else breaks, biz2code still has a
 *           defensible thesis. Written on Day 2, before the UI exists.
 * DEPENDS   gate.service.ts
 * ADR       ADR-003
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Mock the query layer (no real DB — unit tests must run offline)
 *   [ ] Fill in the assertions below
 */

import { describe, it, expect } from 'vitest';

describe('gate invariant', () => {
  it.todo('refuses to approve a phase with unanswered required questions');
  it.todo('refuses to approve a phase that is not the current phase');
  it.todo('advances current_phase by exactly one on approval');
  it.todo('does not advance past phase 4');
  it.todo('revise returns to the same phase and clears approved_at');
  it.todo('revise does not rewind current_phase');
  it.todo('optional questions do not block approval');
});
