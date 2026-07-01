// 1. Retrieve and console.log the h1
const h1 = document.querySelector("h1");
console.log(h1);

// 2. Remove the last paragraph
const article = document.querySelector("article");
const paragraphs = article.querySelectorAll("p");
const lastParagraph = paragraphs[paragraphs.length - 1];
article.removeChild(lastParagraph);

// 3. Change h2 background to red on click
const h2 = document.querySelector("h2");
h2.addEventListener("click", function() {
    h2.style.backgroundColor = "red";
});

// 4. Hide h3 on click
const h3 = document.querySelector("h3");
h3.addEventListener("click", function() {
    h3.style.display = "none";
});

// 5. Make all paragraphs bold on button click
const boldBtn = document.getElementById("boldBtn");
boldBtn.addEventListener("click", function() {
    const allParagraphs = document.querySelectorAll("p");
    for (let i = 0; i < allParagraphs.length; i++) {
        allParagraphs[i].style.fontWeight = "bold";
    }
});

// BONUS 1: Random font size on h1 hover
h1.addEventListener("mouseover", function() {
    const randomSize = Math.floor(Math.random() * 100);
    h1.style.fontSize = `${randomSize}px`;
});

// BONUS 2: Fade out the 2nd paragraph on hover
const secondParagraph = document.querySelectorAll("p")[1];
secondParagraph.addEventListener("mouseover", function() {
    secondParagraph.classList.add("fade");
});
// Reset fade when mouse leaves so it can fade again
secondParagraph.addEventListener("mouseout", function() {
    secondParagraph.classList.remove("fade");
    secondParagraph.style.opacity = "1";
});