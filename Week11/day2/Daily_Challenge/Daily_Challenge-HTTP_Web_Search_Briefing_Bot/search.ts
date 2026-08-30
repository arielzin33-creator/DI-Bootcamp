// src/services/search.ts
import { config } from '../config.js';
import { fetchWithTimeout } from '../lib/withTimeout.js';
import type { SearchResult } from '../types.js';

// Tavily's actual response shape (verified against current docs at
// docs.tavily.com/documentation/api-reference/endpoint/search before
// writing this, not assumed): { query, results: [{ title, url, content,
// score }], response_time }. Note there's no "source" field -- the tool
// contract this server exposes asks for one, so it's derived from the
// result's own URL below.
interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  query: string;
  results: TavilyResult[];
  response_time: number;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

async function searchReal(query: string, k: number): Promise<SearchResult[]> {
  const response = await fetchWithTimeout(
    'https://api.tavily.com/search',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.tavilyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, max_results: k }),
    },
    config.searchTimeoutMs,
  );

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    throw new Error(`Tavily search failed: ${response.status} ${response.statusText} ${bodyText}`);
  }

  const data = (await response.json()) as TavilyResponse;
  return data.results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content,
    source: hostnameOf(r.url),
  }));
}

// Deterministic, clearly-labeled canned results -- used only when
// config.mockMode is on (the default whenever TAVILY_API_KEY isn't set).
// See README.md's "What's real vs. mocked" section for why this exists:
// no Tavily key was available while building and verifying this project.
function searchMock(query: string, k: number): SearchResult[] {
  const base: SearchResult[] = [
    {
      title: `[MOCK] Overview: ${query}`,
      url: 'https://en.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(query),
      snippet: `A general-purpose overview of "${query}", standing in for a real search result. Set TAVILY_API_KEY and MOCK_MODE=false for real results.`,
      source: 'en.wikipedia.org',
    },
    {
      title: `[MOCK] Recent developments in ${query}`,
      url: 'https://example.com/news/' + encodeURIComponent(query),
      snippet: `A placeholder "recent news" result about "${query}". Not a real article -- example.com does not host this content.`,
      source: 'example.com',
    },
    {
      title: `[MOCK] ${query}: a technical primer`,
      url: 'https://example.org/primer/' + encodeURIComponent(query),
      snippet: `A placeholder technical explainer about "${query}". Not a real article.`,
      source: 'example.org',
    },
  ];
  return base.slice(0, k);
}

export async function searchWeb(query: string, k: number): Promise<SearchResult[]> {
  if (config.mockMode || !config.tavilyApiKey) {
    return searchMock(query, k);
  }
  return searchReal(query, k);
}
