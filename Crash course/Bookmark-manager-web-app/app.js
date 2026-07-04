const STORAGE_KEY = 'bookmarks_v1';

function loadBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

function getFaviconUrl(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return null;
  }
}

function normalizeUrl(url) {
  url = url.trim();
  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

function isValidUrl(url) {
  try { new URL(url); return true; } catch { return false; }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '%22').replace(/'/g, '%27');
}

function renderBookmarks(filter = '') {
  const bookmarks = loadBookmarks();
  const list = document.getElementById('bookmark-list');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('count');

  const filtered = filter
    ? bookmarks.filter(b => b.title.toLowerCase().includes(filter.toLowerCase()))
    : bookmarks;

  count.textContent = bookmarks.length;
  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.style.display = 'block';
    empty.querySelector('p').textContent =
      filter ? 'No bookmarks match your search.' : 'No bookmarks yet. Add one above!';
    return;
  }

  empty.style.display = 'none';

  filtered.forEach(({ id, title, url }) => {
    const li = document.createElement('li');
    li.className = 'bookmark-item';
    li.dataset.id = id;

    const faviconUrl = getFaviconUrl(url);
    const faviconHtml = faviconUrl
      ? `<img src="${faviconUrl}" alt="" onerror="this.parentElement.innerHTML='<span class=\\"favicon-fallback\\">&#127760;</span>'" />`
      : `<span class="favicon-fallback">&#127760;</span>`;

    li.innerHTML = `
      <div class="favicon">${faviconHtml}</div>
      <div class="bookmark-info">
        <a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="bookmark-link">
          <div class="bookmark-title">${escapeHtml(title)}</div>
          <div class="bookmark-url">${escapeHtml(url)}</div>
        </a>
      </div>
      <button class="btn btn-delete" data-id="${id}" title="Delete bookmark">&#128465;</button>
    `;

    list.appendChild(li);
  });
}

function addBookmark(title, url) {
  const bookmarks = loadBookmarks();
  bookmarks.unshift({ id: Date.now().toString(), title, url });
  saveBookmarks(bookmarks);
  renderBookmarks(document.getElementById('search').value);
}

function deleteBookmark(id) {
  const bookmarks = loadBookmarks().filter(b => b.id !== id);
  saveBookmarks(bookmarks);
  renderBookmarks(document.getElementById('search').value);
}

document.getElementById('bookmark-form').addEventListener('submit', e => {
  e.preventDefault();

  const titleInput = document.getElementById('title-input');
  const urlInput = document.getElementById('url-input');
  const titleError = document.getElementById('title-error');
  const urlError = document.getElementById('url-error');

  let valid = true;
  titleError.style.display = 'none';
  urlError.style.display = 'none';

  const title = titleInput.value.trim();
  const url = normalizeUrl(urlInput.value);

  if (!title) {
    titleError.style.display = 'block';
    valid = false;
  }

  if (!isValidUrl(url)) {
    urlError.style.display = 'block';
    valid = false;
  }

  if (!valid) return;

  addBookmark(title, url);
  titleInput.value = '';
  urlInput.value = '';
  titleInput.focus();
});

document.getElementById('bookmark-list').addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (btn) deleteBookmark(btn.dataset.id);
});

document.getElementById('search').addEventListener('input', e => {
  renderBookmarks(e.target.value);
});

// ── Theme toggle ──
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(isDark) {
  document.body.classList.toggle('light', !isDark);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const isDark = saved ? saved === 'dark' : true;
  applyTheme(isDark);
}

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.contains('light');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme(isDark);
});

initTheme();
renderBookmarks();
