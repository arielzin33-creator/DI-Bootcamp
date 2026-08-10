/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Orchestrates MRD -> PRD -> Business Plan, then renders DOCX.
 * WHY       Order is a hard dependency: the Business Plan's 'Product Weaknesses' field synthesises MRD gaps and PRD constraints, so it cannot run first.
 * DEPENDS   llm, calculation, benchmark, external, docx services
 * ADR       ADR-007, ADR-010
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Run in dependency order; pass MRD+PRD content into the Business Plan context
 *   [ ] Build the provenance ledger as it goes
 *   [ ] Collect every unvalidated field with its reason
 *   [ ] Write a NEW version row — never overwrite
 */

export type DocType = 'mrd' | 'prd' | 'business_plan';
export const GENERATION_ORDER: DocType[] = ['mrd', 'prd', 'business_plan'];

// TODO: generateAll(projectId) — returns { version, files[], unvalidated[] }
