# Mythic-Atlas

## Description
Mythic-Atlas is an interactive web map of the real Earth, reimagined as a world where ancient mythology was true. Real geography is overlaid with mythical kingdoms, gods, temples, legendary cities, and monsters, each with a short pop-up summary you can click to read.

## Tech Stack
- HTML5 / CSS3 / JavaScript
- Leaflet.js (https://leafletjs.com/) — core interactive map engine
- Leaflet.markercluster (https://github.com/Leaflet/Leaflet.markercluster) — clustering and zoom-based reveal of points of interest
- GeoJSON — data format for kingdoms, points of interest, and creatures (stored as separate files in `/data`)
- ESRI World Shaded Relief tiles — base map showing physical terrain (mountains, rivers, coastlines) with no modern labels or political borders, styled with a CSS filter for the "ancient map" look

## How to Run the Project
This is a static site — there is no backend and no package installation required.

**Option 1 — Live on browser (easiest):**
open `index.html` on browser.

**Important:** because the map loads GeoJSON files via `fetch()`, the project must be served through a local server. Opening `index.html` directly as a file may cause the file not working properly, but worth a try as first option..

**Option 2 — Python HTTP server:**

1. Open a terminal in the project folder and run:
   python3 -m http.server 8000

2. Open `http://localhost:8000` in a browser.

## Main Features
- Explore a real, zoomable world map reskinned with an ancient, mythological aesthetic
- Click temples, kingdoms, and legendary cities to read a short lore summary
- Toggle individual layers on and off (Kingdoms / Temples & Cities / Monsters & Beasts)
- Hand-drawn-map visual style achieved via CSS filtering of a standard basemap
