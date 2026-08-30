const btn = document.getElementById('btn');
const content = document.getElementById('content');

function showLoading() {
  content.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
    <p>Loading...</p>
  `;
}

function showError() {
  content.innerHTML = `<p class="error">Error fetching data. Please try again.</p>`;
}

function showCharacter(person, homeworld) {
  content.innerHTML = `
    <div class="char-info">
      <h2>${person.name}</h2>
      <p><strong>Height:</strong> ${person.height} cm</p>
      <p><strong>Gender:</strong> ${person.gender}</p>
      <p><strong>Birth Year:</strong> ${person.birth_year}</p>
      <p><strong>Home World:</strong> ${homeworld}</p>
    </div>
  `;
}

function getRandomCharacter() {
  showLoading();

  const randomId = Math.floor(Math.random() * 83) + 1;

  fetch(`https://www.swapi.tech/api/people/${randomId}`)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      const person = data.result.properties;
      return fetch(person.homeworld)
        .then(res => res.json())
        .then(planetData => {
          const homeworld = planetData.result.properties.name;
          showCharacter(person, homeworld);
        });
    })
    .catch(() => showError());
}

btn.addEventListener('click', getRandomCharacter);

// Load a character on page load
getRandomCharacter();
