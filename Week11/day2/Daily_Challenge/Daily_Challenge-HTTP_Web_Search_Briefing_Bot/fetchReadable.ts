// src/services/fetchReadable.ts
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { config } from '../config.js';
import { fetchWithTimeout } from '../lib/withTimeout.js';
import type { FetchReadableResponse } from '../types.js';

/**
 * Fetches a URL and extracts its main readable content via Mozilla's
 * Readability library (the same engine behind Firefox's Reader View) --
 * no API key needed, so unlike search_web and summarize_with_citations,
 * this one has no mock fallback and is exercised for real, against real
 * public pages, in every verification run of this project.
 */
export async function fetchReadable(url: string): Promise<FetchReadableResponse> {
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        // A real browser-like UA -- some sites reject requests from an
        // obviously-a-script UA string with a 403 even though the content
        // is otherwise public.
        'User-Agent':
          'Mozilla/5.0 (compatible; WebResearchBriefingBot/1.0; +https://example.com/bot)',
      },
    },
    config.fetchTimeoutMs,
  );

  if (!response.ok) {
    throw new Error(`Fetching ${url} failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();

  // Readability can legitimately return null (paywalled pages, pages that
  // are mostly JS-rendered with no server-side content, non-article pages
  // like a bare image or a login form) -- the exercise's own
  // troubleshooting section anticipates this ("Readability returns empty
  // text"). Returning an explicit empty string rather than throwing lets
  // the caller (the CLI, or summarize_with_citations) decide whether an
  // empty doc is fatal or just skippable, rather than this function
  // making that call unilaterally.
  return {
    url,
    title: article?.title ?? dom.window.document.title ?? url,
    text: article?.textContent?.trim() ?? '',
  };
}
