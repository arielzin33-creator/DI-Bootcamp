// Global variable to hold all bold elements
let allBoldItems;

// Collect all <strong> tags inside the paragraph
function getBoldItems() {
    const paragraph = document.getElementById("mainParagraph");
    allBoldItems = paragraph.querySelectorAll("strong");
}

// Change all bold text to blue
function highlight() {
    getBoldItems();
    for (let i = 0; i < allBoldItems.length; i++) {
        allBoldItems[i].style.color = "blue";
    }
}

// Reset all bold text to black
function returnItemsToDefault() {
    for (let i = 0; i < allBoldItems.length; i++) {
        allBoldItems[i].style.color = "black";
    }
}

// Attach mouse events to the paragraph
const paragraph = document.getElementById("mainParagraph");
paragraph.addEventListener("mouseover", highlight);
paragraph.addEventListener("mouseout", returnItemsToDefault);