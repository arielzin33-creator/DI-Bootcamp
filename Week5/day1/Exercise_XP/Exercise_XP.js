//Exercise 1: Basic Fetch Request

fetch("https://api.giphy.com/v1/gifs/search?q=hilarious&rating=g&api_key=hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error("Error fetching data:", error));

// Exercise 2: Fetch with Additional Query Parameters

const apiKey = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";
const url = `https://api.giphy.com/v1/gifs/search?q=sun&api_key=${apiKey}&limit=10&offset=2`;

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error("Error fetching data:", error));

//Exercise 3: Async/Await Version

async function getStarship() {
    try {
        const response = await fetch("https://www.swapi.tech/api/starships/9/");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const objectStarWars = await response.json();
        console.log(objectStarWars.result);

    } catch (error) {
        console.error("Error fetching starship data:", error);
    }
}

getStarship();

//Exercise 4: Analysis

function resolveAfter2Seconds() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 2000);
    });
}

async function asyncCall() {
    console.log('calling');
    let result = await resolveAfter2Seconds();
    console.log(result);
}

asyncCall();