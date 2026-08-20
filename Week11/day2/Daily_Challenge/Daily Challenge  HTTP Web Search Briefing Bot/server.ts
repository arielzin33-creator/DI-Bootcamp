// src/server.ts
import express from 'express';
import { config } from './config.js';
import { createToolsRouter } from './routes/tools.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use(createToolsRouter());

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  app.use(errorHandler);

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Web research briefing server listening on http://localhost:${config.port}`);
    if (config.mockMode) {
      console.log('[mock mode] search_web and summarize_with_citations will return canned data.');
    }
  });
}
