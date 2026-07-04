const pokeImg     = document.getElementById('pokeImg');
const pokeName    = document.getElementById('pokeName');
const pokeId      = document.getElementById('pokeId');
const pokeHeight  = document.getElementById('pokeHeight');
const pokeWeight  = document.getElementById('pokeWeight');
const pokeType    = document.getElementById('pokeType');
const loadingIcon = document.getElementById('loadingIcon');
const errorMsg    = document.getElementById('errorMsg');
const btnRandom   = document.getElementById('btnRandom');
const btnPrev     = document.getElementById('btnPrev');
const btnNext     = document.getElementById('btnNext');

// Tracks the currently displayed Pokémon id for prev/next navigation
let currentId = null;
const TOTAL_POKEMON = 898;

function showLoading() {
  pokeImg.style.display = 'none';
  errorMsg.style.display = 'none';
  loadingIcon.style.display = 'block';
}

function showError(msg = "Oh no! That Pokémon isn't available…") {
  loadingIcon.style.display = 'none';
  pokeImg.style.display = 'none';
  errorMsg.textContent = msg;
  errorMsg.style.display = 'block';
  pokeName.textContent  = '-';
  pokeId.textContent    = '#000';
  pokeHeight.textContent = '-';
  pokeWeight.textContent = '-';
  pokeType.innerHTML    = '-';
}

function displayPokemon(data) {
  currentId = data.id;

  // Prefer the official artwork, fall back to default sprite
  const imgSrc =
    data.sprites.other?.['official-artwork']?.front_default ||
    data.sprites.front_default;

  pokeName.textContent  = data.name;
  pokeId.textContent    = `#${String(data.id).padStart(3, '0')}`;
  pokeHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
  pokeWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;

  const typeBadges = data.types.map(t =>
    `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
  ).join(' ');
  pokeType.innerHTML = typeBadges;

  loadingIcon.style.display = 'none';
  errorMsg.style.display = 'none';

  pokeImg.onload = () => { pokeImg.style.display = 'block'; };
  pokeImg.src = imgSrc;
}

async function fetchPokemon(idOrName) {
  showLoading();
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    displayPokemon(data);
  } catch {
    showError();
  }
}

async function fetchRandom() {
  const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  await fetchPokemon(randomId);
}

async function fetchPrev() {
  if (currentId === null) return;
  const prevId = currentId > 1 ? currentId - 1 : TOTAL_POKEMON;
  await fetchPokemon(prevId);
}

async function fetchNext() {
  if (currentId === null) return;
  const nextId = currentId < TOTAL_POKEMON ? currentId + 1 : 1;
  await fetchPokemon(nextId);
}

btnRandom.addEventListener('click', fetchRandom);
btnPrev.addEventListener('click', fetchPrev);
btnNext.addEventListener('click', fetchNext);

// Load a random Pokémon on startup
fetchRandom();
