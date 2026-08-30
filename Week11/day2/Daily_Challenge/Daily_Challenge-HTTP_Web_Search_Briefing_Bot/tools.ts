// src/routes/tools.ts
import { Router } from 'express';
import { requireBearerToken } from '../middleware/auth.js';
import { TOOL_SCHEMAS } from '../lib/toolSchemas.js';
import {
  fetchReadableSchema,
  saveMarkdownSchema,
  searchWebSchema,
  summarizeSchema,
} from '../lib/schemas.js';
import { searchWeb } from '../services/search.js';
import { fetchReadable } from '../services/fetchReadable.js';
import { summarizeWithCitations } from '../services/summarize.js';
import { saveMarkdown } from '../services/markdown.js';
import type { ListToolsResponse } from '../types.js';

export function createToolsRouter(): Router {
  const router = Router();

  // Deliberately not behind requireBearerToken: this is a capability
  // listing, not an action -- there's nothing here a caller couldn't
  // already infer by reading this project's source, and requiring auth
  // just to discover *what* exists (as opposed to using it) doesn't add
  // real protection.
  router.get('/tools', (req, res) => {
    const body: ListToolsResponse = { tools: TOOL_SCHEMAS };
    res.json(body);
  });

  router.use('/tools', requireBearerToken);

  router.post('/tools/search_web', async (req, res) => {
    const { query, k } = searchWebSchema.parse(req.body);
    const results = await searchWeb(query, k);
    res.json({ results });
  });

  router.post('/tools/fetch_readable', async (req, res) => {
    const { url } = fetchReadableSchema.parse(req.body);
    const result = await fetchReadable(url);
    res.json(result);
  });

  router.post('/tools/summarize_with_citations', async (req, res) => {
    const { topic, docs } = summarizeSchema.parse(req.body);
    const result = await summarizeWithCitations(topic, docs);
    res.json(result);
  });

  router.post('/tools/save_markdown', async (req, res) => {
    const { filename, content } = saveMarkdownSchema.parse(req.body);
    const result = await saveMarkdown(filename, content);
    res.json(result);
  });

  return router;
}
