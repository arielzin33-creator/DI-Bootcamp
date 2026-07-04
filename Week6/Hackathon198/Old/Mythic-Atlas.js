// 1. Tell Leaflet to treat the map as a simple flat coordinate system instead of Earth
let map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 3
});

// 2. Define the exact pixel boundaries of your fantasy artwork [Height, Width]
let bounds = [
    [0, 0],
    [1000, 1000]
];

// 3. Drop your high-res map image onto the canvas as an overlay layer
let image = L.imageOverlay('C:\Users\ariel\OneDrive\Documenten\GitHub\DI-Bootcamp\Week6\Hackathon198\Gemini_Generated_Image_53c5jz53c5jz53c5.png', bounds).addTo(map);
let Image = document.getElementById("my-map")

// 4. Center your camera view on the newly created world
map.fitBounds(bounds);

// 5. Add custom fantasy location markers and interactive popups
let capitalCity = L.marker([500, 500]).addTo(map);
capitalCity.bindPopup("<b>Stormwind Capital</b><br>The heart of the kingdom.");