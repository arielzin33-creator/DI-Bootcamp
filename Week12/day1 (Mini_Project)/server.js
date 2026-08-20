import { createApp } from './app.js';
import { config } from './src/config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`JWT auth server listening on http://localhost:${config.port}`);
});
