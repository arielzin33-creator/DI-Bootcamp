const planets = [
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptun'
]

const section = document.querySelector("section")

planets.forEach((planetName) => {

    const div = document.createElement("div");
    div.classList.add("planet");

    div.classList.add(planetName.toLowerCase());

    section.appendChild(div);
});