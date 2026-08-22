# SnapShot

A React + React Router image gallery powered by the [Pexels API](https://www.pexels.com/api/documentation/).

## Features

- **Home page** with a search bar and four category cards (Mountain, Beaches, Birds, Food).
- **Gallery page** (`/SnapScout/:query`) shared by both category clicks and searches — fetches and displays 30 images at a time.
- Hover transitions on each image (zoom + photographer credit overlay).
- Prev/Next pagination through the Pexels result set.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Get a free API key from [pexels.com/api](https://www.pexels.com/api/) (sign in, then copy your key).

3. Copy `.env.example` to `.env` and paste your key in:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_PEXELS_API_KEY=your_actual_key_here
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Project structure

- `src/api/pexels.js` — Pexels API request wrapper
- `src/categories.js` — the four home-page categories
- `src/components/` — `Header`, `SearchBar`, `CategoryCard`, `ImageGrid`, `Pagination`
- `src/pages/Home.jsx` — landing page
- `src/pages/Gallery.jsx` — search results / category gallery page
