"""
wiki_tool.py -- a thin wrapper around langchain_community's Wikipedia
utility, returning a short list of {title, snippet, source} dicts rather
than the pre-formatted string `WikipediaAPIWrapper.run()` returns.

`.load(query)` (not `.run(query)`) is used deliberately -- it returns
structured `Document` objects with `title` / `summary` / `source` metadata
already split apart, verified directly against real Wikipedia results
before choosing it over `.run()`'s single pre-formatted block. That
structure is what makes it possible to build a proper `[wiki:Title]`
citation key per result instead of citing "Wikipedia" as one undifferentiated
blob for however many articles were actually pulled in.

Three separate, real things were found while getting live Wikipedia calls
to actually work reliably -- worth being precise about which fixed what,
since the first diagnosis was wrong and it's worth saying so rather than
quietly correcting it:

1. `wikipedia.wikipedia.API_URL` hardcodes `http://` (no TLS). This
   sandbox's network fails plain-HTTP requests to this host at a
   network/proxy level (confirmed: manually replicating the library's
   exact request returned a 503 with body `"DNS resolution failure"`, not
   anything from Wikipedia's own API). Forcing HTTPS is a real, necessary
   fix, verified directly.
2. A first attempt (mis-)diagnosed a missing `User-Agent` as the cause,
   based on a `curl -A ""` reproducing Wikipedia's *"Please set a
   user-agent..."* policy message. That message is real and Wikipedia
   does ask for a UA -- but re-testing with only the HTTPS fix and the
   library's *default* UA succeeded fine, proving the UA was never what
   was actually causing the specific failures being chased. Kept anyway,
   since it's still the considerate thing to send.
3. The actual dominant cause of ongoing intermittent failures, found by
   hitting the raw API directly in a loop: genuine `429 Too Many
   Requests` -- `"You are making too many requests to the API. Please
   follow the best practices at
   .../Wikimedia_APIs/Rate_limits"`. This is Wikipedia's real, current
   rate limit, almost certainly tied to how much this sandbox's shared
   egress IP has already queried Wikipedia over the course of building
   several exercises. Not something client code can "fix" -- only handle
   gracefully, which is what the retry-with-backoff and the
   graceful-empty-list behavior below do.
"""

import time

import wikipedia
import wikipedia.wikipedia as _wikipedia_internals
from langchain_community.utilities.wikipedia import WikipediaAPIWrapper

_wikipedia_internals.API_URL = "https://en.wikipedia.org/w/api.php"
wikipedia.set_user_agent("rag-agent-exercise/1.0 (educational use)")

_wiki = WikipediaAPIWrapper(top_k_results=2, doc_content_chars_max=800)
_MAX_RETRIES = 2
_RETRY_BACKOFF_SECONDS = 2.0


def wiki_citation_key(title: str) -> str:
    """`Python (programming language)` -> `wiki:Python_(programming_language)`, matching the exercise's own example format."""
    return f"wiki:{title.replace(' ', '_')}"


def search_wikipedia(query: str) -> list[dict]:
    """
    Fetch up to 2 Wikipedia article summaries for `query`.

    Retries a rate-limited (429) response a couple of times with a short
    backoff -- a transient condition worth waiting out briefly, unlike a
    genuinely missing/ambiguous article. Still returns [] rather than
    raising for any failure that persists past the retries (rate limit
    that didn't clear, a disambiguation error, no network at all) --
    callers (the planner/answer function) are expected to handle "no
    evidence found" gracefully rather than this function forcing that
    decision on them by raising.
    """
    last_error: Exception | None = None
    for attempt in range(_MAX_RETRIES + 1):
        try:
            docs = _wiki.load(query)
            return [
                {
                    "title": doc.metadata.get("title", query),
                    "snippet": doc.page_content,
                    "source": wiki_citation_key(doc.metadata.get("title", query)),
                    "url": doc.metadata.get("source", ""),
                }
                for doc in docs
            ]
        except Exception as error:  # noqa: BLE001 -- deliberately broad, see docstring
            last_error = error
            if attempt < _MAX_RETRIES:
                time.sleep(_RETRY_BACKOFF_SECONDS * (attempt + 1))

    return []
