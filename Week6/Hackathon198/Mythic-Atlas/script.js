// Mythic-Atlas

const map = L.map('map', { center: [30, 20], zoom: 3, minZoom: 2, maxZoom: 12 });

// ESRI shaded relief - physical terrain only, no labels or modern borders
const baseTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    className: 'ancient-tiles'
}).addTo(map);

// Icons
const iconDir = './icons/';
const icons = {
    temple: L.icon({ iconUrl: `${iconDir}temple.svg`, iconSize: [32, 32], iconAnchor: [16, 16] }),
    castle: L.icon({ iconUrl: `${iconDir}castle.svg`, iconSize: [32, 32], iconAnchor: [16, 16] }),
    village: L.icon({ iconUrl: `${iconDir}village.svg`, iconSize: [26, 26], iconAnchor: [13, 13] }),
    kraken: L.icon({ iconUrl: `${iconDir}kraken.svg`, iconSize: [36, 36], iconAnchor: [18, 18] }),
    serpent: L.icon({ iconUrl: `${iconDir}serpent.svg`, iconSize: [36, 36], iconAnchor: [18, 18] }),
    ruin: L.icon({ iconUrl: `${iconDir}ruin.svg`, iconSize: [26, 26], iconAnchor: [13, 13] })
};

// Layers
const overlays = {
    kingdoms: L.layerGroup().addTo(map),
    templesAndCities: L.markerClusterGroup().addTo(map),
    monstersAndBeasts: L.layerGroup().addTo(map)
};

L.control.layers(null, {
    'Kingdoms': overlays.kingdoms,
    'Temples & Cities': overlays.templesAndCities,
    'Monsters & Beasts': overlays.monstersAndBeasts
}, { collapsed: false }).addTo(map);

// Creates markers from a GeoJSON point collection
function createPointLayer(geojson, layerGroup) {
    return L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => {
            const kind = feature.properties && feature.properties.kind;
            return L.marker(latlng, { icon: icons[kind] || icons.village });
        },
        onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            layer.bindPopup(`
                <div class="popup-mythic">
                    <h3>${props.name || 'Unknown'}</h3>
                    <p>${props.summary || ''}</p>
                </div>
            `);
        }
    }).addTo(layerGroup);
}

// Creates kingdom polygons from a GeoJSON polygon collection
function createPolygonLayer(geojson, layerGroup) {
    return L.geoJSON(geojson, {
        style: {
            color: '#8a6a2e',
            weight: 2,
            fillColor: '#d9c391',
            fillOpacity: 0.25
        },
        onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            layer.bindPopup(`<h3>${props.name || 'Kingdom'}</h3><p>${props.summary || ''}</p>`);
        }
    }).addTo(layerGroup);
}

// Loads all layers and fits the map to show everything
function initLayers(poiData, creaturesData, kingdomsData) {
    const bounds = [];
    bounds.push(createPointLayer(poiData, overlays.templesAndCities).getBounds());
    bounds.push(createPointLayer(creaturesData, overlays.monstersAndBeasts).getBounds());
    bounds.push(createPolygonLayer(kingdomsData, overlays.kingdoms).getBounds());

    const validBounds = bounds.filter(b => b && b.isValid());
    if (validBounds.length) {
        const combinedBounds = validBounds.reduce((acc, next) => acc.extend(next));
        map.fitBounds(combinedBounds, { padding: [40, 40] });
    }
}

// Load GeoJSON files and initialize
Promise.all([
    fetch('./data/poi.geojson').then(r => r.json()),
    fetch('./data/creatures.geojson').then(r => r.json()),
    fetch('./data/kingdoms.geojson').then(r => r.json())
]).then(([poiData, creaturesData, kingdomsData]) => {
    initLayers(poiData, creaturesData, kingdomsData);
}).catch(err => console.error('Failed to load GeoJSON data:', err));

// Close intro overlay
document.getElementById('intro-close').addEventListener('click', () => {
    document.getElementById('intro-overlay').style.display = 'none';
});