// src/services/summarize.ts
import { config } from '../config.js';
import { fetchWithTimeout } from '../lib/withTimeout.js';
import type { SummarizeDoc, SummarizeResponse, SummarizeSource } from '../types.js';

const BULLET_COUNT = 5;
const MAX_BULLET_LENGTH = 200;

function buildPrompt(topic: string, docs: SummarizeDoc[]): string {
  const numberedDocs = docs
    .map((doc, index) => `[${index + 1}] ${doc.title} (${doc.url})\n${doc.text.slice(0, 2000)}`)
    .join('\n\n');

  return [
    `Topic: ${topic}`,
    '',
    'Sources (numbered):',
    numberedDocs,
    '',
    `Write exactly ${BULLET_COUNT} bullet points summarizing the topic using only the sources above.`,
    `Each bullet must be ${MAX_BULLET_LENGTH} characters or fewer, and must include at least one`,
    'inline citation marker like [1] or [2] referring to the source number it draws from.',
    '',
    'Respond with ONLY a JSON object in exactly this shape, no other text:',
    '{"bullets": ["...", "...", "...", "...", "..."]}',
  ].join('\n');
}

/**
 * Best-effort JSON extraction from a raw model response. Local models
 * asked for "only JSON" still sometimes wrap it in a code fence or add a
 * sentence before/after -- this is exactly the failure mode the
 * exercise's own troubleshooting section names ("LLM JSON parse
 * failures"). Tries a direct parse first, then falls back to extracting
 * the first balanced-looking `{...}` block.
 */
function extractJSON(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    // fall through to extraction
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`Could not find a JSON object in the model's response: ${raw.slice(0, 200)}`);
  }
  return JSON.parse(match[0]);
}

async function callOllama(prompt: string, temperature: number): Promise<string> {
  const response = await fetchWithTimeout(
    `${config.ollamaBaseUrl}/api/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: { temperature },
      }),
    },
    config.llmTimeoutMs,
  );

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    throw new Error(`Ollama chat failed: ${response.status} ${response.statusText} ${bodyText}`);
  }

  // Ollama's /api/chat (stream: false) response shape: { message: { role,
  // content }, done, ... }. Verified against current docs before writing
  // this, not assumed.
  const data = (await response.json()) as { message: { content: string } };
  return data.message.content;
}

function buildSources(docs: SummarizeDoc[]): SummarizeSource[] {
  return docs.map((doc, index) => ({ i: index + 1, title: doc.title, url: doc.url }));
}

function validateBullets(bullets: unknown): string[] {
  if (!Array.isArray(bullets) || bullets.length !== BULLET_COUNT) {
    throw new Error(
      `Expected exactly ${BULLET_COUNT} bullets, got ${Array.isArray(bullets) ? bullets.length : typeof bullets}.`,
    );
  }
  for (const bullet of bullets) {
    if (typeof bullet !== 'string' || bullet.length > MAX_BULLET_LENGTH) {
      throw new Error(`Every bullet must be a string of ${MAX_BULLET_LENGTH} characters or fewer.`);
    }
  }
  return bullets as string[];
}

async function summarizeReal(topic: string, docs: SummarizeDoc[]): Promise<SummarizeResponse> {
  const prompt = buildPrompt(topic, docs);

  // First attempt at the configured temperature; one retry at a lower,
  // more deterministic temperature if the first response isn't valid
  // JSON or doesn't match the required shape -- exactly the "retry with
  // lower temperature" the exercise's troubleshooting section suggests.
  for (const temperature of [0.7, 0.1]) {
    const raw = await callOllama(prompt, temperature);
    try {
      const parsed = extractJSON(raw) as { bullets?: unknown };
      const bullets = validateBullets(parsed.bullets);
      return { bullets, sources: buildSources(docs) };
    } catch (error) {
      if (temperature === 0.1) {
        throw new Error(
          `Ollama returned output that did not match the required shape, even after a retry ` +
            `at lower temperature: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      // else: fall through to the retry
    }
  }

  // Unreachable, but keeps TypeScript's control-flow analysis satisfied.
  throw new Error('Unreachable');
}

// Deterministic, clearly-labeled canned bullets built from the real input
// docs (not fabricated topic-unrelated text) -- used only when
// config.mockMode is on. See README.md's "What's real vs. mocked" section:
// no reachable local LLM was available while building and verifying this
// project.
function summarizeMock(topic: string, docs: SummarizeDoc[]): SummarizeResponse {
  // Split each doc into sentences up front, so bullets can draw a
  // *different* sentence each time rather than always the first one.
  // Caught by actually running this against a real fetch result: with
  // only one document successfully fetched (a realistic case -- see
  // README.md, two of three mock search URLs 404 in every real run), the
  // original version indexed docs by `i % docs.length` but always took
  // that doc's *first* sentence regardless of `i`, producing the same
  // bullet five times over. Cycling through sentences within a doc too
  // fixes that, and still degrades gracefully to repeats only if a doc
  // genuinely has fewer than 5 sentences.
  const sentencesByDoc = docs.map((doc) => doc.text.split(/(?<=[.!?])\s+/).filter(Boolean));

  const bullets: string[] = [];
  for (let i = 0; i < BULLET_COUNT; i += 1) {
    const docIndex = i % docs.length;
    const sentences = sentencesByDoc[docIndex];
    const sentence = sentences[i % sentences.length] ?? docs[docIndex].title;
    const bullet = `[MOCK] ${sentence.slice(0, 180)} [${docIndex + 1}]`.slice(0, MAX_BULLET_LENGTH);
    bullets.push(bullet);
  }
  return { bullets, sources: buildSources(docs) };
}

export async function summarizeWithCitations(
  topic: string,
  docs: SummarizeDoc[],
): Promise<SummarizeResponse> {
  if (docs.length === 0) {
    throw new Error('docs must contain at least one document to summarize.');
  }
  if (config.mockMode) {
    return summarizeMock(topic, docs);
  }
  return summarizeReal(topic, docs);
}
