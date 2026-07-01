const form = document.getElementById("libform");
const shuffleBtn = document.getElementById("shuffle-button");
const storySpan = document.getElementById("story");
const storyContainer = document.getElementById("story-container");

// Store the current word values globally
// so the shuffle button can reuse them
let words = {
    noun: "",
    adjective: "",
    person: "",
    verb: "",
    place: ""
};

// ---- Story Templates (Bonus: at least 3 for shuffling) ----
const stories = [

    function(w) {
        return `Once upon a time, <strong>${w.person}</strong> decided to visit
    <strong>${w.place}</strong> with a very <strong>${w.adjective}</strong>
    <strong>${w.noun}</strong>. As soon as they arrived, they began to
    <strong>${w.verb}</strong> like nobody was watching. The locals had never
    seen anything quite like it, and the story spread across
    <strong>${w.place}</strong> for generations.`;
    },

    function(w) {
        return `Breaking news from <strong>${w.place}</strong>: a <strong>${w.adjective}</strong>
    <strong>${w.noun}</strong> was spotted trying to <strong>${w.verb}</strong> on top of
    the tallest building. Eyewitnesses say that <strong>${w.person}</strong> was seen
    laughing uncontrollably at the scene. Authorities are still investigating.`;
    },

    function(w) {
        return `Dear Diary, today I went to <strong>${w.place}</strong> and found
    a <strong>${w.adjective}</strong> <strong>${w.noun}</strong> just sitting there.
    I called <strong>${w.person}</strong> immediately and said:
    "You won't believe this, but it actually tried to <strong>${w.verb}</strong>!"
    We both agreed it was the strangest Tuesday of our lives.`;
    },

    function(w) {
        return `Scientists at <strong>${w.place}</strong> have confirmed that a
    <strong>${w.adjective}</strong> <strong>${w.noun}</strong> can indeed
    <strong>${w.verb}</strong> under the right conditions. Lead researcher
    <strong>${w.person}</strong> published the findings in the
    <em>Journal of Improbable Events</em>, calling it "a milestone in modern science."`;
    },

    function(w) {
        return `The recipe called for one <strong>${w.adjective}</strong>
    <strong>${w.noun}</strong>, a pinch of mystery, and the ability to
    <strong>${w.verb}</strong> on command. <strong>${w.person}</strong> followed
    every step carefully in the kitchen at <strong>${w.place}</strong>,
    and the result was… surprisingly edible.`;
    }

];

// Track which story was last shown to avoid repeating it immediately
let lastStoryIndex = -1;

// ---- Helper: highlight empty fields ----
function validateInputs() {
    const ids = ["noun", "adjective", "person", "verb", "place"];
    let isValid = true;

    for (let i = 0; i < ids.length; i++) {
        const input = document.getElementById(ids[i]);
        input.classList.remove("error");

        if (input.value.trim() === "") {
            input.classList.add("error");
            isValid = false;
        }
    }

    return isValid;
}

// ---- Helper: pick a random story that isn't the same as last time ----
function getRandomStoryIndex() {
    if (stories.length === 1) return 0;

    let index;
    do {
        index = Math.floor(Math.random() * stories.length);
    } while (index === lastStoryIndex);

    lastStoryIndex = index;
    return index;
}

// ---- Helper: render a story ----
function renderStory() {
    const index = getRandomStoryIndex();
    storySpan.innerHTML = stories[index](words);

    // Reveal the story container
    storyContainer.style.display = "block";

    // Reveal the shuffle button
    shuffleBtn.style.display = "block";
}

// ---- Form submit ----
form.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!validateInputs()) {
        storySpan.textContent = "";
        storyContainer.style.display = "none";
        shuffleBtn.style.display = "none";
        return;
    }

    // Store the values
    words.noun = document.getElementById("noun").value.trim();
    words.adjective = document.getElementById("adjective").value.trim();
    words.person = document.getElementById("person").value.trim();
    words.verb = document.getElementById("verb").value.trim();
    words.place = document.getElementById("place").value.trim();

    renderStory();
});

// ---- Bonus: Shuffle button ----
// Picks a new story using the same words already entered
shuffleBtn.addEventListener("click", function() {
    renderStory();
});