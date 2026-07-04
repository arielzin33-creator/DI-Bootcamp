// Mythic-Atlas

const map = L.map('map', { center: [30, 20], zoom: 3, minZoom: 2, maxZoom: 12 });

// Stamen Watercolor - hand-painted ancient map look, no modern labels or borders
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
    className: 'ancient-tiles'
}).addTo(map);

// Icons
const iconDir = './icons/';
const icons = {
    temple:  L.icon({ iconUrl: `${iconDir}temple.svg`,  iconSize: [32, 32], iconAnchor: [16, 16] }),
    castle:  L.icon({ iconUrl: `${iconDir}castle.svg`,  iconSize: [32, 32], iconAnchor: [16, 16] }),
    village: L.icon({ iconUrl: `${iconDir}village.svg`, iconSize: [26, 26], iconAnchor: [13, 13] }),
    kraken:  L.icon({ iconUrl: `${iconDir}kraken.svg`,  iconSize: [36, 36], iconAnchor: [18, 18] }),
    serpent: L.icon({ iconUrl: `${iconDir}serpent.svg`, iconSize: [36, 36], iconAnchor: [18, 18] }),
    ruin:    L.icon({ iconUrl: `${iconDir}ruin.svg`,    iconSize: [26, 26], iconAnchor: [13, 13] })
};

// Kingdom colors per mythology
const mythologyColors = {
    greek:    { color: '#4a6fa5', fillColor: '#b8cce0' },
    egyptian: { color: '#c8900a', fillColor: '#f0d860' },
    norse:    { color: '#4a7fa0', fillColor: '#b0d0e0' },
    vedic:    { color: '#c4622d', fillColor: '#eaa880' },
    persian:  { color: '#7a5c9a', fillColor: '#c8b0e0' },
    chinese:  { color: '#9a2020', fillColor: '#e09090' },
    japanese: { color: '#8b3535', fillColor: '#d8a8a8' },
    maya:     { color: '#2d7a2d', fillColor: '#98d898' },
    inca:     { color: '#b05a20', fillColor: '#e0b080' },
    native:   { color: '#6b4226', fillColor: '#c8a87a' },
    atlantis: { color: '#1a5a9a', fillColor: '#7ab0d8' },
};

// Layers
const overlays = {
    kingdoms:          L.layerGroup().addTo(map),
    templesAndCities:  L.markerClusterGroup().addTo(map),
    monstersAndBeasts: L.layerGroup().addTo(map)
};

L.control.layers(null, {
    'Kingdoms':          overlays.kingdoms,
    'Temples & Cities':  overlays.templesAndCities,
    'Monsters & Beasts': overlays.monstersAndBeasts
}, { collapsed: false }).addTo(map);

// Creates markers from a GeoJSON point collection, era-aware
function createPointLayer(geojson, layerGroup, eraKey) {
    return L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => {
            const kind = getEffectiveKind(feature, eraKey);
            return L.marker(latlng, { icon: icons[kind] || icons.village });
        },
        onEachFeature: (feature, layer) => {
            const props     = feature.properties || {};
            const kind      = getEffectiveKind(feature, eraKey);
            const isRuined  = props.ruinsAfter && eraOrder[eraKey] > eraOrder[props.ruinsAfter];
            const desc      = isRuined && props.summaryRuined ? props.summaryRuined : (props.summary || '');
            layer.bindPopup(`
                <div class="popup-mythic">
                    <div class="popup-header">
                        <img src="${iconDir}${kind}.svg" class="popup-icon" />
                        <h3>${props.name || 'Unknown'}</h3>
                    </div>
                    <div class="popup-divider"></div>
                    <p>${desc}</p>
                </div>
            `);
        }
    }).addTo(layerGroup);
}

// Creates kingdom polygons, color-coded by mythology, with hover highlight
function createPolygonLayer(geojson, layerGroup) {
    return L.geoJSON(geojson, {
        style: feature => {
            const m = mythologyColors[feature.properties.mythology] || {};
            return {
                color:       m.color     || '#8a6a2e',
                fillColor:   m.fillColor || '#d9c391',
                weight:      2,
                fillOpacity: 0.25
            };
        },
        onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            layer.bindPopup(`
                <div class="popup-mythic">
                    <h3>${props.name || 'Kingdom'}</h3>
                    <div class="popup-divider"></div>
                    <p>${props.summary || ''}</p>
                </div>
            `);
            layer.on({
                mouseover: e => {
                    e.target.setStyle({ weight: 3, fillOpacity: 0.45 });
                    e.target.bringToFront();
                },
                mouseout: e => {
                    e.target.setStyle({ weight: 2, fillOpacity: 0.25 });
                }
            });
        }
    }).addTo(layerGroup);
}

// ---- Combined filter (era progression + minZoomToShow) ---------------------
// Era order: creation=0, heroes=1, monsters=2
// disappearsAfter (kingdoms): polygon removed after that era index
// ruinsAfter (POIs): marker icon changes to ruin after that era index, but stays on map

const eraNames = ['Age of Creation', 'Age of Heroes', 'Age of Monsters'];
const eraKeys  = ['creation', 'heroes', 'monsters'];
const eraOrder = { creation: 0, heroes: 1, monsters: 2 };
let currentEra = 0;
let allData    = {};

function getEffectiveKind(feature, eraKey) {
    const p = feature.properties || {};
    if (p.ruinsAfter && eraOrder[eraKey] > eraOrder[p.ruinsAfter]) return 'ruin';
    return p.kind || 'village';
}

function applyFilters() {
    const eraKey = eraKeys[currentEra];
    const zoom   = map.getZoom();

    overlays.templesAndCities.clearLayers();
    overlays.monstersAndBeasts.clearLayers();
    overlays.kingdoms.clearLayers();

    const zoomFilter = geojson => ({
        ...geojson,
        features: geojson.features.filter(f => {
            const p = f.properties || {};
            const zoomOk      = zoom >= (p.minZoomToShow || 0);
            const appearsFrom = p.appearsFrom;
            const eraOk       = !appearsFrom || eraOrder[eraKey] >= eraOrder[appearsFrom];
            return zoomOk && eraOk;
        })
    });

    // Kingdoms: remove those whose civilization has disappeared by this era
    const kingdomFilter = geojson => ({
        ...geojson,
        features: geojson.features.filter(f => {
            const p = f.properties || {};
            if (!p.disappearsAfter) return true;
            return eraOrder[eraKey] <= eraOrder[p.disappearsAfter];
        })
    });

    createPointLayer(zoomFilter(allData.poi),       overlays.templesAndCities, eraKey);
    createPointLayer(zoomFilter(allData.creatures), overlays.monstersAndBeasts, eraKey);
    createPolygonLayer(kingdomFilter(zoomFilter(allData.kingdoms)), overlays.kingdoms);
}

document.getElementById('slider').addEventListener('input', e => {
    currentEra = Number(e.target.value);
    document.getElementById('era-label').textContent = eraNames[currentEra];
    applyFilters();
});

map.on('zoomend', applyFilters);

// ---- Search box ------------------------------------------------------------

let allMarkers = [];

function buildSearchIndex(geojson) {
    geojson.features.forEach(f => {
        if (f.geometry.type !== 'Point') return;
        const [lng, lat] = f.geometry.coordinates;
        allMarkers.push({ name: f.properties.name || '', latlng: [lat, lng] });
    });
}

const searchInput   = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    if (!query) return;
    allMarkers
        .filter(m => m.name.toLowerCase().includes(query))
        .slice(0, 6)
        .forEach(m => {
            const div = document.createElement('div');
            div.textContent = m.name;
            div.addEventListener('click', () => {
                map.setView(m.latlng, 6);
                searchInput.value = '';
                searchResults.innerHTML = '';
            });
            searchResults.appendChild(div);
        });
});

document.addEventListener('click', e => {
    if (!document.getElementById('search-box').contains(e.target))
        searchResults.innerHTML = '';
});

// ---- Click-to-add lore -----------------------------------------------------

const STORAGE_KEY = 'mythic-atlas-custom-markers';
const creatureKinds = ['kraken', 'serpent'];

function getTargetLayer(kind) {
    return creatureKinds.includes(kind) ? overlays.monstersAndBeasts : overlays.templesAndCities;
}

function placeUserMarker({ id, name, summary, kind, lat, lng }) {
    const latlng = [lat, lng];
    const marker = L.marker(latlng, { icon: icons[kind] || icons.village });

    const popup = L.popup().setContent(() => {
        const div = document.createElement('div');
        div.className = 'popup-mythic';
        div.innerHTML = `
            <div class="popup-header">
                <img src="${iconDir}${kind}.svg" class="popup-icon" />
                <h3>${name}</h3>
            </div>
            <div class="popup-divider"></div>
            <p>${summary}</p>
            <div class="popup-divider"></div>
        `;
        const btn = document.createElement('button');
        btn.textContent = 'Remove';
        btn.className = 'popup-remove-btn';
        btn.addEventListener('click', () => {
            getTargetLayer(kind).removeLayer(marker);
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.filter(m => m.id !== id)));
            allMarkers.splice(allMarkers.findIndex(m => m.name === name && m.latlng[0] === lat), 1);
        });
        div.appendChild(btn);
        return div;
    });

    marker.bindPopup(popup).addTo(getTargetLayer(kind));
    allMarkers.push({ name, latlng });
}

function loadSavedMarkers() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.forEach(placeUserMarker);
}

let addingLore = false;

document.getElementById('add-lore-btn').addEventListener('click', () => {
    addingLore = true;
    document.getElementById('add-lore-panel').classList.remove('hidden');
    map.getContainer().style.cursor = 'crosshair';
});

document.getElementById('lore-cancel').addEventListener('click', () => {
    addingLore = false;
    document.getElementById('add-lore-panel').classList.add('hidden');
    map.getContainer().style.cursor = '';
});

map.on('click', e => {
    if (!addingLore) return;

    const name    = document.getElementById('lore-name').value.trim() || 'Unknown';
    const summary = document.getElementById('lore-summary').value.trim();
    const kind    = document.getElementById('lore-kind').value;
    const id      = Date.now();
    const { lat, lng } = e.latlng;

    placeUserMarker({ id, name, summary, kind, lat, lng });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.push({ id, name, summary, kind, lat, lng });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    document.getElementById('lore-name').value    = '';
    document.getElementById('lore-summary').value = '';
    addingLore = false;
    document.getElementById('add-lore-panel').classList.add('hidden');
    map.getContainer().style.cursor = '';
});

// ---- Load GeoJSON and initialize -------------------------------------------

function initLayers(poiData, creaturesData, kingdomsData) {
    allData = { poi: poiData, creatures: creaturesData, kingdoms: kingdomsData };

    buildSearchIndex(poiData);
    buildSearchIndex(creaturesData);

    applyFilters();
    loadSavedMarkers();

    const bounds = [
        L.geoJSON(poiData).getBounds(),
        L.geoJSON(creaturesData).getBounds(),
        L.geoJSON(kingdomsData).getBounds()
    ].filter(b => b && b.isValid());

    if (bounds.length)
        map.fitBounds(bounds.reduce((a, b) => a.extend(b)), { padding: [40, 40] });
}

Promise.all([
    fetch('./data/poi.geojson').then(r => r.json()),
    fetch('./data/creatures.geojson').then(r => r.json()),
    fetch('./data/kingdoms.geojson').then(r => r.json())
]).then(([poi, creatures, kingdoms]) => {
    initLayers(poi, creatures, kingdoms);
}).catch(err => console.error('Failed to load GeoJSON data:', err));

// Close intro overlay
document.getElementById('intro-close').addEventListener('click', () => {
    document.getElementById('intro-overlay').style.display = 'none';
});

// ---- Games -----------------------------------------------------------------

let gameMode = null; // 'quiz' | 'hunt' | null

function show(id)   { document.getElementById(id).classList.remove('hidden'); }
function hide(id)   { document.getElementById(id).classList.add('hidden'); }

document.getElementById('game-btn').addEventListener('click', () => {
    if (gameMode) return;
    const menu = document.getElementById('game-menu');
    menu.classList.toggle('hidden');
});

document.getElementById('game-menu-close').addEventListener('click', () => hide('game-menu'));
document.getElementById('start-quiz-btn').addEventListener('click', () => { hide('game-menu'); startQuiz(); });
document.getElementById('start-hunt-btn').addEventListener('click', () => { hide('game-menu'); startHunt(); });

// ---- shared helpers --------------------------------------------------------

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ---- Mythology Quiz --------------------------------------------------------

let quizQuestions = [];
let quizIndex     = 0;
let quizScore     = 0;
let quizLine      = null;
let quizPin       = null;
let quizWaiting   = false;

function startQuiz() {
    quizQuestions = shuffle(
        (allData.poi?.features || []).filter(f => f.properties?.summary)
    ).slice(0, 10);
    quizIndex   = 0;
    quizScore   = 0;
    quizWaiting = false;
    gameMode    = 'quiz';

    map.getContainer().style.cursor = 'crosshair';
    show('quiz-panel');
    hide('quiz-result');
    hide('quiz-next');
    loadQuizQuestion();
}

function loadQuizQuestion() {
    if (quizLine) { map.removeLayer(quizLine); quizLine = null; }
    if (quizPin)  { map.removeLayer(quizPin);  quizPin  = null; }

    const q = quizQuestions[quizIndex];
    document.getElementById('quiz-counter').textContent = `${quizIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quiz-score-display').textContent = `${quizScore} pts`;
    document.getElementById('quiz-text').textContent = q.properties.summary;
    hide('quiz-result');
    hide('quiz-next');
    quizWaiting = false;
}

function handleQuizClick(latlng) {
    if (quizWaiting) return;
    quizWaiting = true;

    const q   = quizQuestions[quizIndex];
    const [lng, lat] = q.geometry.coordinates;
    const dist = haversineKm(latlng.lat, latlng.lng, lat, lng);

    const maxPts = 1000;
    const pts    = Math.max(0, Math.round(maxPts * Math.exp(-dist / 2000)));
    quizScore   += pts;

    quizPin = L.circleMarker([lat, lng], {
        radius: 8, color: '#2a6a20', fillColor: '#98d898', fillOpacity: 0.9, weight: 2
    }).addTo(map);

    quizLine = L.polyline([[latlng.lat, latlng.lng], [lat, lng]], {
        color: '#8a4a20', weight: 2, dashArray: '6 4', opacity: 0.75
    }).addTo(map);

    document.getElementById('quiz-place-name').textContent   = q.properties.name;
    document.getElementById('quiz-distance').textContent     = `${Math.round(dist).toLocaleString()} km away`;
    document.getElementById('quiz-points-earned').textContent = `+${pts} pts`;
    document.getElementById('quiz-score-display').textContent = `${quizScore} pts`;

    show('quiz-result');
    show('quiz-next');
    if (quizIndex >= quizQuestions.length - 1) {
        document.getElementById('quiz-next').textContent = 'See Final Score →';
    } else {
        document.getElementById('quiz-next').textContent = 'Next →';
    }
}

document.getElementById('quiz-next').addEventListener('click', () => {
    quizIndex++;
    if (quizIndex >= quizQuestions.length) {
        document.getElementById('quiz-text').textContent =
            `Final score: ${quizScore} / ${quizQuestions.length * 1000} pts`;
        document.getElementById('quiz-counter').textContent = 'Done!';
        hide('quiz-next');
        if (quizLine) { map.removeLayer(quizLine); quizLine = null; }
        if (quizPin)  { map.removeLayer(quizPin);  quizPin  = null; }
        return;
    }
    loadQuizQuestion();
});

document.getElementById('quiz-exit').addEventListener('click', exitQuiz);

function exitQuiz() {
    if (quizLine) { map.removeLayer(quizLine); quizLine = null; }
    if (quizPin)  { map.removeLayer(quizPin);  quizPin  = null; }
    gameMode = null;
    map.getContainer().style.cursor = '';
    hide('quiz-panel');
}

// ---- Creature Hunt ---------------------------------------------------------

const creatureClues = {
    'Leviathan':          'In the deep east where the sun first touches water, something ancient coils beneath the waves.',
    'Charybdis':          'Between two lands that nearly touch — a whirlpool older than any navy.',
    'Kraken of the Deep': 'Far north where the cold sea meets no shore, tentacles wide as longships stir the black.',
    'Cetus':              'South of the birthplace of heroes, a serpent large enough to swallow islands waits.',
    'Jörmungandr':        'The world-serpent circles all lands. Its tail rests where the frozen sky meets frozen sea.',
    'Scylla':             'A six-headed terror clings to the same strait as the whirlpool — on the opposite cliff.',
    'Tiamat':             'In the primordial waters between two great rivers, the mother of monsters stirs.',
    'Makara':             'Where the sacred river meets the warm sea, a beast of crocodile and fish holds court.',
    'Serpent of the Nile':'The great river of the god-kings hides within it a serpent as long as its own course.',
    'Hydra':              'In the swamps near the land of Perseus, many heads regrow for every one cut off.',
    'Pacific Serpent':    'Halfway between the new world and the old, in the widest water on earth.',
    'Atlantic Kraken':    'In the middle of the ocean that drowned Atlantis, ink-black arms reach for the sky.',
    'Caribbean Serpent':  'Where the islands of the hero-twins lie scattered — a feathered serpent descends to sea.'
};

const oceanFogRegions = [
    { name: 'North Atlantic',   coords: [[-80,0],[70,0],[70,-80],[-80,-80]] },
    { name: 'South Atlantic',   coords: [[-70,-40],[5,-40],[5,-70],[-70,-70]] },
    { name: 'North Pacific',    coords: [[100,60],[60,60],[60,100],[100,100]] , raw: [[60,100],[60,170],[-60,170],[-60,100]] },
    { name: 'South Pacific',    coords: [[-60,100],[-60,280],[60,280],[60,100]] , raw: [[-180,-60],[-180,0],[180,0],[180,-60]] },
    { name: 'Indian Ocean',     coords: [[20,-70],[80,-70],[80,30],[20,30]]  },
    { name: 'Arctic',           coords: [[-180,70],[180,70],[180,90],[-180,90]] },
    { name: 'Mediterranean',    coords: [[-6,30],[36,30],[36,45],[-6,45]] },
    { name: 'Caribbean',        coords: [[-90,8],[-60,8],[-60,28],[-90,28]] },
];

const fogPolygons    = [];
let huntTargets      = [];
let huntIndex        = 0;
let huntFound        = 0;

function buildOceanFog() {
    const fogStyle = {
        color: '#0a1525', fillColor: '#0a1a2e', fillOpacity: 0.45,
        weight: 0, interactive: false
    };
    const oceanBoxes = [
        [[-180, -85], [180, -85], [180, 85], [-180, 85]]
    ];
    // We simply layer translucent fog as a single global rectangle; individual
    // creature reveal punches a hole by adding a bright circle at the creature location.
    const fogLayer = L.rectangle([[-85, -180], [85, 180]], {
        ...fogStyle, className: 'hunt-fog'
    }).addTo(map);
    fogPolygons.push(fogLayer);
}

function clearFog() {
    fogPolygons.forEach(p => map.removeLayer(p));
    fogPolygons.length = 0;
}

function startHunt() {
    huntTargets = shuffle(allData.creatures?.features || []).slice(0, 8);
    huntIndex   = 0;
    huntFound   = 0;
    gameMode    = 'hunt';

    map.getContainer().style.cursor = 'crosshair';
    buildOceanFog();
    show('hunt-panel');
    showHuntClue();
}

function showHuntClue() {
    document.getElementById('hunt-score-display').textContent = `${huntFound} found`;
    document.getElementById('hunt-feedback').textContent = '';

    if (huntIndex >= huntTargets.length) {
        document.getElementById('hunt-clue').textContent =
            `Hunt complete! You found ${huntFound} of ${huntTargets.length} creatures.`;
        document.getElementById('hunt-feedback').textContent = 'The seas are revealed.';
        gameMode = null;
        map.getContainer().style.cursor = '';
        return;
    }

    const name = huntTargets[huntIndex].properties?.name || 'Unknown Creature';
    const clue = creatureClues[name] || `An ancient sea beast lurks somewhere in the deep waters of the world.`;
    document.getElementById('hunt-clue').textContent = clue;
}

function handleHuntClick(latlng) {
    if (huntIndex >= huntTargets.length) return;

    const target  = huntTargets[huntIndex];
    const [lng, lat] = target.geometry.coordinates;
    const dist = haversineKm(latlng.lat, latlng.lng, lat, lng);
    const name = target.properties?.name || 'Creature';

    const feedback = document.getElementById('hunt-feedback');

    if (dist <= 2000) {
        huntFound++;
        L.circleMarker([lat, lng], {
            radius: 10, color: '#8a0a0a', fillColor: '#d84040', fillOpacity: 0.85, weight: 2
        }).bindPopup(`<div class="popup-mythic"><h3>${name}</h3><div class="popup-divider"></div><p>${target.properties.summary || ''}</p></div>`).addTo(map);

        feedback.textContent = `Found! The ${name} was ${Math.round(dist).toLocaleString()} km from your mark.`;
        huntIndex++;
        setTimeout(showHuntClue, 1800);
    } else {
        const direction = bearingHint(latlng.lat, latlng.lng, lat, lng);
        feedback.textContent = `Nothing here... try ${direction} (${Math.round(dist).toLocaleString()} km off).`;
    }
}

function bearingHint(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    const deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    const dirs = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
    return dirs[Math.round(deg / 45) % 8];
}

document.getElementById('hunt-exit').addEventListener('click', exitHunt);

function exitHunt() {
    clearFog();
    gameMode = null;
    huntIndex = 0;
    huntFound = 0;
    map.getContainer().style.cursor = '';
    hide('hunt-panel');
}

// ---- Route map clicks through game modes -----------------------------------

map.off('click');

map.on('click', e => {
    if (gameMode === 'quiz') { handleQuizClick(e.latlng); return; }
    if (gameMode === 'hunt') { handleHuntClick(e.latlng); return; }

    // normal add-lore mode
    if (!addingLore) return;
    const name    = document.getElementById('lore-name').value.trim() || 'Unknown';
    const summary = document.getElementById('lore-summary').value.trim();
    const kind    = document.getElementById('lore-kind').value;
    const id      = Date.now();
    const { lat, lng } = e.latlng;

    placeUserMarker({ id, name, summary, kind, lat, lng });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.push({ id, name, summary, kind, lat, lng });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    document.getElementById('lore-name').value    = '';
    document.getElementById('lore-summary').value = '';
    addingLore = false;
    document.getElementById('add-lore-panel').classList.add('hidden');
    map.getContainer().style.cursor = '';
});
