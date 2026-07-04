function returnNumbers(str) {
    // \d matches any digit character; the 'g' flag finds ALL matches, not just the first
    const matches = str.match(/\d/g);

    // match() returns an array of individual matched characters, or null if none found
    return matches ? matches.join('') : '';
}

// Demonstration
console.log(returnNumbers('k5k3q2g5z6x9bn')); // "532569"
console.log(returnNumbers('abcdef')); // "" (no digits found)
console.log(returnNumbers('a1b22c333')); // "122333"