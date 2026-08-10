/**
 * ─────────────────────────────────────────────────────────────
 * PURPOSE   Groq client. JSON mode, one retry, Gemini fallback, hard timeout.
 * WHY       The single most likely thing to fail live. Every failure path must degrade to a marked section, never to a crashed request.
 * DEPENDS   config/env.ts
 * ADR       ADR-009, ADR-011
 * ─────────────────────────────────────────────────────────────
 *
 * TODO
 *   [ ] Call Groq with JSON response format
 *   [ ] 30s timeout, one retry on malformed JSON
 *   [ ] Fall back to Gemini if Groq is unavailable
 *   [ ] On final failure return { ok:false } — caller marks the section unavailable
 */

export interface LlmResult<T> {
  ok: boolean;
  data?: T;
  failureReason?: string;   // surfaced in the document as 'unavailable — ...'
}

/**
 * MODEL CHOICE: llama-3.3-70b-versatile
 *
 * Groq's free tier caps per model at 30 req/min AND 6,000 tokens/min.
 * llama-3.3-70b-versatile sits on the STANDARD quota. Llama 4 Maverick runs
 * at HALF quota (15 RPM / 3,000 TPM) - worse for a pipeline that fires three
 * back-to-back document-generation calls in under a minute. 70B versatile is
 * also the model most consistently reported reliable for structured JSON
 * output on Groq.
 *
 * RISK: three sequential calls (MRD -> PRD -> Business Plan), each with a
 * benchmarks+answers prompt and a multi-page output, can approach 6,000
 * tokens EACH. Back-to-back, that risks the TPM cap even while under the
 * 30 RPM cap. Mitigations below: a pacing delay between calls, and treating
 * 429 as a fallback trigger, not just malformed JSON.
 */
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_FALLBACK_MODEL = 'llama-3.1-8b-instant';  // faster, lower quality — last resort before Gemini
const MIN_MS_BETWEEN_CALLS = 2500;   // pacing: keeps 3 sequential calls comfortably under 30 RPM / 6000 TPM
const TIMEOUT_MS = 28_000;           // stay inside the 30s budget with margin for the DOCX render step

// TODO: generateSection<T>(prompt: string, schemaHint: string): Promise<LlmResult<T>>
//   - call Groq with response_format: { type: 'json_object' }, model: GROQ_MODEL
//   - on 429: wait for Retry-After (from the response header), retry ONCE, then fall to Gemini
//   - on malformed JSON: retry ONCE with the same model, then fall to Gemini
//   - on any final failure: return { ok: false, failureReason: ... } — caller marks the
//     section 'unavailable', never throws
//   - hard timeout at TIMEOUT_MS via AbortController

// TODO: buildGuardrailPreamble(allowedCitations) — the model may cite ONLY these

// TODO: paceCalls() — await MIN_MS_BETWEEN_CALLS since the last Groq call before firing the next
