// Small helpers for normalizing the Google Books API's `volumeInfo` shape, which is
// inconsistent in ways that will crash naive code:
//
//  - `publishedDate` isn't reliably a full date. It can be "2005-07-16", "2005-07",
//    or just "2005" depending on the book's metadata. A `new Date(publishedDate)`
//    call handles all three, but `new Date("2005")` in some engines parses as UTC
//    while "2005-07-16" parses as local time — safer to just regex the leading year.
//  - `imageLinks` is frequently missing entirely (older/obscure titles), so a
//    thumbnail can't be assumed to exist.
//  - `authors` is an array that can also be entirely absent.

export function extractYear(publishedDate) {
  if (!publishedDate) return null;
  const match = publishedDate.match(/^\d{4}/);
  return match ? Number(match[0]) : null;
}

export function formatAuthors(authors) {
  if (!authors || authors.length === 0) return 'Unknown author';
  return authors.join(', ');
}

export function getThumbnail(imageLinks) {
  if (!imageLinks) return null;
  const url = imageLinks.thumbnail || imageLinks.smallThumbnail;
  if (!url) return null;
  // Google Books commonly returns plain "http://books.google.com/..." URLs (not just
  // protocol-relative "//..."). Left as http, these get silently mixed-content-blocked
  // by the browser once this app is deployed over https — so both forms are upgraded.
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return url;
}

export function sortBooks(books, order) {
  const withYear = [...books];
  withYear.sort((a, b) => {
    const yearA = extractYear(a.volumeInfo.publishedDate) ?? -Infinity;
    const yearB = extractYear(b.volumeInfo.publishedDate) ?? -Infinity;
    return order === 'oldest' ? yearA - yearB : yearB - yearA;
  });
  return withYear;
}
