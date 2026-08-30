const form = document.getElementById("sunrise-form");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async function(event) {
    event.preventDefault(); // prevent page reload

    const lat1 = document.getElementById("lat1").value;
    const lng1 = document.getElementById("lng1").value;
    const lat2 = document.getElementById("lat2").value;
    const lng2 = document.getElementById("lng2").value;

    resultsDiv.innerHTML = "Loading...";

    await getBothSunrises(lat1, lng1, lat2, lng2);
});

async function getSunrise(lat, lng) {
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
        throw new Error(`API returned status: ${data.status}`);
    }

    return data.results.sunrise;
}

async function getBothSunrises(lat1, lng1, lat2, lng2) {
    try {
        // Both requests fire concurrently; we wait for BOTH to resolve before displaying anything
        const [sunrise1, sunrise2] = await Promise.all([
            getSunrise(lat1, lng1),
            getSunrise(lat2, lng2)
        ]);

        displayResults(sunrise1, sunrise2);

    } catch (error) {
        console.error("Error fetching sunrise data:", error);
        resultsDiv.innerHTML = `<p>Something went wrong: ${error.message}</p>`;
    }
}

function displayResults(sunrise1, sunrise2) {
    // Convert the raw UTC timestamps into readable local-formatted strings
    const time1 = new Date(sunrise1).toLocaleTimeString();
    const time2 = new Date(sunrise2).toLocaleTimeString();

    resultsDiv.innerHTML = `
    <p>City 1 sunrise: ${time1}</p>
    <p>City 2 sunrise: ${time2}</p>
  `;
}