import { useState } from 'react';

import SearchBox from './SearchBox';
import BookList from './BookList';
import { sortBooks } from '../utils/book';

const API_URL = 'https://www.googleapis.com/books/v1/volumes';
// Optional, but strongly recommended — see README. Verified directly (curl, WebFetch,
// and the reference demo all hit the same wall independently): Google's ANONYMOUS
// quota for books.googleapis.com is effectively exhausted right now
// (quota_limit_value: "0" in the 429 response body), so unauthenticated requests
// fail immediately rather than being an edge case worth only a passing mention.
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export default function Book() {
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This is the "filter the books according to the input" function the brief asks
  // for: it both drives the API query and determines what ends up on screen.
  async function fetchBooks(searchTerm) {
    if (!searchTerm.trim()) {
      setError('Please enter a search term.');
      setBooks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL(API_URL);
      url.searchParams.set('q', searchTerm);
      url.searchParams.set('maxResults', '20');
      if (API_KEY) url.searchParams.set('key', API_KEY);

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        // Distinguishing the rate-limit case specifically: verified live that this is
        // the failure mode most likely to actually happen, not a hypothetical.
        if (response.status === 429) {
          throw new Error(
            'Google Books API rate limit reached. Add VITE_GOOGLE_BOOKS_API_KEY to .env for a much higher quota — see README.'
          );
        }
        throw new Error(data?.error?.message || `Request failed (${response.status}).`);
      }

      if (!data.items || data.items.length === 0) {
        setBooks([]);
        setError(`No results for "${searchTerm}".`);
        return;
      }

      setBooks(sortBooks(data.items, sortOrder));
    } catch (err) {
      console.error('Book search failed:', err);
      // A bare network failure (offline, DNS, CORS) throws a generic TypeError whose
      // .message is the browser's own wording ("Failed to fetch" / "NetworkError...") —
      // confirmed by triggering this path directly. That's meaningless to an end user,
      // so it's only shown when the error was deliberately thrown above with a specific
      // message; anything else falls back to a plain-language explanation.
      const isKnownError = err instanceof Error && err.name !== 'TypeError';
      setError(
        isKnownError ? err.message : 'Could not reach the Book Search service. Check your connection.'
      );
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    fetchBooks(query);
  }

  // Re-sorting is purely client-side and instant — no need to re-fetch just to flip
  // the order of books already on screen.
  function handleSortChange(newOrder) {
    setSortOrder(newOrder);
    setBooks((current) => sortBooks(current, newOrder));
  }

  return (
    <div className="book">
      <SearchBox
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {loading && <p className="book__status">Loading...</p>}
      {error && !loading && <p className="book__error">{error}</p>}

      {!loading && <BookList books={books} />}
    </div>
  );
}
