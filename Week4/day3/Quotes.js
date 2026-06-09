const quotes = [
    { id: 0, author: "Oscar Wilde", quote: "Be yourself; everyone else is already taken.", likes: 0 },
    { id: 1, author: "Einstein", quote: "Imagination is more important than knowledge.", likes: 0 },
    { id: 2, author: "Marcus Aurelius", quote: "The obstacle is the way.", likes: 0 },
    { id: 3, author: "Seneca", quote: "We suffer more in imagination than in reality.", likes: 0 },
    { id: 4, author: "Aristotle", quote: "We are what we repeatedly do.", likes: 0 },
];

let lastId = null;
let currentQuote = null;

// ── Random quote ──────────────────────────────────────────
document.getElementById("btn").addEventListener("click", function() {
    let random;
    do {
        random = quotes[Math.floor(Math.random() * quotes.length)];
    } while (random.id === lastId);

    lastId = random.id;
    currentQuote = random;
    renderQuote(random);
});

function renderQuote(q) {
    document.getElementById("output").innerHTML = `
    <p>${q.quote}</p>
    <p>— ${q.author}</p>
    <p>Likes: ${q.likes}</p>
  `;
}

// ── Add quote form ────────────────────────────────────────
document.getElementById("addForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const newQuote = {
        id: quotes.length,
        quote: document.getElementById("newQuote").value,
        author: document.getElementById("newAuthor").value,
        likes: 0,
    };

    quotes.push(newQuote);
    e.target.reset();
    alert(`Quote added with id ${newQuote.id}`);
});

// ── Action buttons ────────────────────────────────────────
document.getElementById("btnCharsWithSpaces").addEventListener("click", function() {
    if (!currentQuote) return alert("Generate a quote first!");
    alert(`Chars (with spaces): ${currentQuote.quote.length}`);
});

document.getElementById("btnCharsNoSpaces").addEventListener("click", function() {
    if (!currentQuote) return alert("Generate a quote first!");
    alert(`Chars (no spaces): ${currentQuote.quote.replace(/ /g, "").length}`);
});

document.getElementById("btnWords").addEventListener("click", function() {
    if (!currentQuote) return alert("Generate a quote first!");
    alert(`Words: ${currentQuote.quote.split(" ").length}`);
});

document.getElementById("btnLike").addEventListener("click", function() {
    if (!currentQuote) return alert("Generate a quote first!");
    currentQuote.likes++;
    renderQuote(currentQuote);
});

// ── Filter form ───────────────────────────────────────────
let filteredQuotes = [];
let filterIndex = 0;

document.getElementById("filterForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const search = document.getElementById("filterAuthor").value.toLowerCase();
    filteredQuotes = quotes.filter(q => q.author.toLowerCase().includes(search));
    filterIndex = 0;
    renderFiltered();
});

document.getElementById("btnPrev").addEventListener("click", function() {
    if (!filteredQuotes.length) return;
    filterIndex = (filterIndex - 1 + filteredQuotes.length) % filteredQuotes.length;
    renderFiltered();
});

document.getElementById("btnNext").addEventListener("click", function() {
    if (!filteredQuotes.length) return;
    filterIndex = (filterIndex + 1) % filteredQuotes.length;
    renderFiltered();
});

function renderFiltered() {
    if (!filteredQuotes.length) {
        document.getElementById("filterOutput").textContent = "No quotes found.";
        return;
    }
    const q = filteredQuotes[filterIndex];
    document.getElementById("filterOutput").innerHTML = `
    <p>${q.quote}</p>
    <p>— ${q.author}</p>
    <p>${filterIndex + 1} / ${filteredQuotes.length}</p>
  `;
}