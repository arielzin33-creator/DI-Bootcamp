const BASE_URL = 'https://api.chucknorris.io';

function checkResponse(res) {
    if (res.status === 404) throw new Error(`Resource not found (HTTP 404).`);
    if (!res.ok) throw new Error(`Request failed with status HTTP ${res.status}: ${res.statusText}`);
    return res.json();
}

function fetchJoke(category) {
    fetch(`${BASE_URL}/jokes/random?category=${encodeURIComponent(category)}`)
        .then(res => checkResponse(res))
        .then(data => console.log(data.value))
        .catch(err => console.error(err.message))
        .finally(() => console.log('all done'));
}

fetchJoke('science');