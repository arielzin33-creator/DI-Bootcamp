// src/cli/brief.ts
import type {
  FetchReadableResponse,
  SearchResult,
  SummarizeResponse,
} from '../types.js';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8787';
const TOKEN = process.env.MCP_HTTP_TOKEN || '';
const DOMAINS_TO_FETCH = 3;

function todayFilename(): string {
  const iso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `brief_${iso}.md`;
}

async function callTool<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${SERVER_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${path} failed: ${response.status} ${response.statusText} ${text}`);
  }

  return (await response.json()) as T;
}

function buildMarkdown(topic: string, summary: SummarizeResponse): string {
  const lines: string[] = [];
  lines.push(`# Briefing: ${topic}`, '', `_Generated ${new Date().toISOString()}_`, '');
  lines.push('## Summary', '');
  for (const bullet of summary.bullets) {
    lines.push(`- ${bullet}`);
  }
  lines.push('', '## Sources', '');
  for (const source of summary.sources) {
    lines.push(`${source.i}. [${source.title}](${source.url})`);
  }
  lines.push('');
  return lines.join('\n');
}

async function run(): Promise<void> {
  const topic = process.argv.slice(2).join(' ').trim();
  if (!topic) {
    console.error('Usage: npm run brief -- "your topic"');
    process.exitCode = 1;
    return;
  }

  console.log(`Searching for: ${topic}`);
  const { results } = await callTool<{ results: SearchResult[] }>('/tools/search_web', {
    query: topic,
    k: 5,
  });
  console.log(`  found ${results.length} results`);

  // Fetch readable content for the first few *distinct domains*, not just
  // the first N results -- several results from the same site would waste
  // fetches on redundant content rather than actually diversifying the
  // sources the summary draws from.
  const seenDomains = new Set<string>();
  const toFetch: SearchResult[] = [];
  for (const result of results) {
    if (toFetch.length >= DOMAINS_TO_FETCH) break;
    const domain = result.source;
    if (seenDomains.has(domain)) continue;
    seenDomains.add(domain);
    toFetch.push(result);
  }

  console.log(`Fetching readable content from ${toFetch.length} domain(s)...`);
  const docs: FetchReadableResponse[] = [];
  for (const result of toFetch) {
    try {
      const doc = await callTool<FetchReadableResponse>('/tools/fetch_readable', { url: result.url });
      if (doc.text.trim().length === 0) {
        console.warn(`  (empty content from ${result.url}, skipping)`);
        continue;
      }
      docs.push(doc);
      console.log(`  fetched ${result.url} (${doc.text.length} chars)`);
    } catch (error) {
      console.warn(`  failed to fetch ${result.url}: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (docs.length === 0) {
    throw new Error('No documents could be fetched -- nothing to summarize.');
  }

  console.log('Summarizing with citations...');
  const summary = await callTool<SummarizeResponse>('/tools/summarize_with_citations', {
    topic,
    docs: docs.map((d) => ({ title: d.title, url: d.url, text: d.text })),
  });

  const markdown = buildMarkdown(topic, summary);
  const filename = todayFilename();

  console.log(`Saving ${filename}...`);
  const { path } = await callTool<{ path: string }>('/tools/save_markdown', {
    filename,
    content: markdown,
  });

  console.log(`\nSaved: ${path}`);
}

run().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
