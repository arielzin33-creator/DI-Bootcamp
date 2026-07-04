const apiKey = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const gifContainer = document.getElementById("gif-container");
const deleteAllBtn = document.getElementById("delete-all-btn");

// Handle form submission
form.addEventListener("submit", async function(event) {
    event.preventDefault(); // prevent page reload

    const query = input.value.trim();
    if (!query) return;

    await getRandomGif(query);
    input.value = "";
});

// Handle "DELETE ALL" button
deleteAllBtn.addEventListener("click", function() {
    gifContainer.innerHTML = "";
});

async function getRandomGif(query) {
    const url = `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Giphy's random endpoint returns an empty array [] in "data" if no gif is found
        if (Array.isArray(data.data) && data.data.length === 0) {
            console.log(`No gif found for "${query}"`);
            return;
        }

        const gifUrl = data.data.images.original.url;
        displayGif(gifUrl);

    } catch (error) {
        console.error("Error fetching random gif:", error);
    }
}

function displayGif(gifUrl) {
    // Wrapper div holds both the image and its own delete button
    const gifWrapper = document.createElement("div");
    gifWrapper.classList.add("gif-wrapper");

    const img = document.createElement("img");
    img.src = gifUrl;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "DELETE";
    deleteBtn.addEventListener("click", function() {
        gifWrapper.remove();
    });

    gifWrapper.appendChild(img);
    gifWrapper.appendChild(deleteBtn);
    gifContainer.appendChild(gifWrapper);
}