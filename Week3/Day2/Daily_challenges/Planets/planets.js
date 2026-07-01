// Array of planet objects — each has a name, color class, and moon count
const planets = [
    { name: "Mercury", colorClass: "mercury", moons: 0 },
    { name: "Venus", colorClass: "venus", moons: 0 },
    { name: "Earth", colorClass: "earth", moons: 1 },
    { name: "Mars", colorClass: "mars", moons: 2 },
    { name: "Jupiter", colorClass: "jupiter", moons: 95 },
    { name: "Saturn", colorClass: "saturn", moons: 146 },
    { name: "Uranus", colorClass: "uranus", moons: 28 },
    { name: "Neptune", colorClass: "neptune", moons: 16 }
];

// Retrieve the section from the DOM
const section = document.querySelector(".listPlanets");

// Loop through each planet
for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];

    // --- Create the planet div ---
    const planetDiv = document.createElement("div");
    planetDiv.classList.add("planet", planet.colorClass);

    // Add the planet name as a label
    const planetName = document.createElement("p");
    planetName.textContent = planet.name;
    planetDiv.appendChild(planetName);

    // --- Create moons (Bonus) ---
    // We cap the displayed moons at 10 for visual clarity
    // since Jupiter has 95 and Saturn has 146
    const displayedMoons = planet.moons > 10 ? 10 : planet.moons;

    for (let j = 0; j < displayedMoons; j++) {

        const moonDiv = document.createElement("div");
        moonDiv.classList.add("moon");

        // Position each moon in a circle around the planet
        // using trigonometry (cos/sin) to spread them evenly
        const angle = (j / displayedMoons) * 2 * Math.PI;
        const orbitRadius = 70; // distance from planet center in px

        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius;

        moonDiv.style.left = `${50 + x}px`;
        moonDiv.style.top = `${50 + y}px`;

        planetDiv.appendChild(moonDiv);
    }

    // Add moon count as a note if there are more than 10
    if (planet.moons > 10) {
        const moonNote = document.createElement("p");
        moonNote.textContent = `+${planet.moons} moons`;
        moonNote.style.color = "white";
        moonNote.style.fontSize = "9px";
        moonNote.style.position = "absolute";
        moonNote.style.bottom = "-24px";
        moonNote.style.width = "100px";
        moonNote.style.textAlign = "center";
        planetDiv.appendChild(moonNote);
    }

    // Append the completed planet div to the section
    section.appendChild(planetDiv);
}