// 1. Prompt the user for words separated by commas
const input = prompt("Enter several words separated by commas:");

// 2. Put the words into an array and trim whitespace
const words = input.split(",").map(word => word.trim());

// 3. Find the length of the longest word
let longestLength = 0;
for (let i = 0; i < words.length; i++) {
    if (words[i].length > longestLength) {
        longestLength = words[i].length;
    }
}

// The frame width = longest word + 2 spaces (padding) + 2 stars (sides)
const innerWidth = longestLength + 2;

// Build the horizontal border: e.g. "***********"
let border = "";
for (let i = 0; i < innerWidth + 2; i++) {
    border += "*";
}

// 4. Display the frame
console.log(border);

for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Pad the word with spaces on the right so all rows are the same width
    let padding = "";
    for (let j = 0; j < longestLength - word.length; j++) {
        padding += " ";
    }

    console.log(`* ${word}${padding} *`);
}

console.log(border);