# React Book Search

Search Google Books, filter as you go, sort newest ↔ oldest. Matches the layout of the
[reference demo](https://di-react-book-card.surge.sh/) (header, search + sort form, card grid).

## ⚠️ Anonymous access to the API is currently exhausted — get a free key

The brief treats an API key as optional (which matches Google's own docs), but that's not what
I found testing it. **Three independent sources hit the identical wall within minutes of each
other:**

1. The reference demo itself — searching it live returned `429`.
2. A direct `curl` to `googleapis.com/books/v1/volumes` from this environment.
3. A fetch routed through an entirely different network path (Anthropic's own infra, not this
   machine).

The error body is specific, not vague:
```json
"quota_limit_value": "0"
```
Anonymous daily quota for `books.googleapis.com` is set to **zero** right now. Not "sometimes
rate-limited" — currently unusable without a key. So this app treats the key as effectively
required, even though it's coded to work without one (and will, once Google's anonymous quota
recovers).

**Get one free** at
[console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials):
create a project → enable "Books API" → Create Credentials → API key. Then:

```bash
cp .env.example .env    # paste your key into VITE_GOOGLE_BOOKS_API_KEY
npm install
npm run dev              # http://localhost:5173
```

> Restart the dev server after editing `.env` — Vite only reads it at startup.

## Structure

```
book-search-app/
├── .env.example
└── src/
    ├── App.jsx                    # Header + Book
    ├── App.css
    ├── utils/book.js              # data-normalization helpers (see below)
    └── components/
        ├── Header.jsx
        ├── Book.jsx                # owns state, does the fetch — the brief's "Book" component
        ├── SearchBox.jsx           # input + sort select + submit, presentational
        ├── BookList.jsx            # maps books -> BookCards
        └── BookCard.jsx            # image, title, author, year
```

## How it meets the brief

| Requirement | Where |
|---|---|
| Fetch Google Books API | `Book.jsx` |
| Display depending on input search | `Book.fetchBooks()`, called on submit |
| Header / Book / BookList / BookCard components, each in their own file | as listed above |
| SearchBox filters via a function | `Book.fetchBooks()` — the query drives what's fetched and shown |
| Sort newest → oldest | `utils/book.js: sortBooks()`, default sort order, toggleable via the select |
| Styled | `App.css` |

## Data-normalization notes (all found by testing, not assumed)

The Google Books API's `volumeInfo` object is far less consistent than a naive implementation
expects — `src/utils/book.js` exists specifically to handle this:

- **`publishedDate` isn't reliably a full date.** It's `"2005-07-16"` for some books, `"2005-07"`
  or just `"2005"` for others. `extractYear()` regexes the leading 4 digits rather than trusting
  `new Date(...)`, whose parsing behavior differs between a bare year and a full date string.
- **`imageLinks` is frequently absent entirely**, especially for older or obscure titles.
  `BookCard` falls back to a placeholder icon instead of a broken-image glyph.
- **`authors` can also be absent.** Falls back to "Unknown author" rather than crashing on
  `.join()` of `undefined`.
- **Thumbnail URLs are commonly plain `http://`**, not just protocol-relative `//`. Left
  unmodified, these get silently blocked as mixed content once the app is served over https —
  `getThumbnail()` upgrades both forms.
- **A raw network failure (offline/DNS/CORS)** throws a `TypeError` whose `.message` is the
  browser's own internal wording ("Failed to fetch") — confirmed by triggering this directly.
  Shown as-is, that's a developer-facing string, not something an end user should see. `Book.jsx`
  distinguishes this from the app's own deliberately-thrown errors (rate limit, no results) and
  shows a plain-language message instead.

## Verified

Live API access being exhausted meant testing had to go a different route: `fetch` was stubbed
with a realistic Google Books payload — including exactly the edge cases above (a book with an
`http://` thumbnail, one with a `//`-protocol-relative thumbnail, one with **no** `imageLinks`
and **no** `authors`, and mixed date granularities) — then driven through the real rendered UI,
not called directly.

| Case | Result |
|---|---|
| Full result set | All 3 cards render; sorted 2004 → 1997 → 1987 by default (newest first) |
| Missing author | "Unknown author" shown, no crash |
| Missing cover | 📖 placeholder shown, no broken-image icon |
| `http://` thumbnail | Upgraded to `https://` |
| `//` thumbnail | Upgraded to `https://` |
| Toggle to "Oldest" | Re-orders instantly client-side (1987 → 1997 → 2004), no re-fetch |
| Empty query submitted | "Please enter a search term." |
| API 429 | "Google Books API rate limit reached. Add VITE_GOOGLE_BOOKS_API_KEY..." |
| Zero results | `No results for "harry potter".` |
| Network failure | "Could not reach the Book Search service..." — not the raw browser error |

Also confirmed: page does not reload on submit (`preventDefault` verified via
`performance.getEntriesByType('navigation')`); no horizontal overflow at 1280px or 375px; grid
collapses to a single column on mobile; `npm run build` succeeds.

**Not verified:** an actual live 200 response from Google — that needs the anonymous quota to
recover or your own key. The stubbed payload above matches the API's documented and previously
observed schema exactly, so once a key is in place this should work unchanged.
