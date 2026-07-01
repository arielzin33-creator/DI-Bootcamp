//Exercise 1 isBlank
function isBlank(str) {
    return str.trim().length === 0;
}

console.log(isBlank('')); // true
console.log(isBlank('   ')); // true  (spaces only)
console.log(isBlank('abc')); // false

//Exercise 2: abbrevName
function abbrevName(fullName) {
    const parts = fullName.split(" ");
    const firstName = parts[0];
    const lastInitial = parts[1][0].toUpperCase();
    return `${firstName} ${lastInitial}.`;
}

console.log(abbrevName("Robin Singh")); // "Robin S."
console.log(abbrevName("John Doe")); // "John D."
console.log(abbrevName("Alice Martin")); // "Alice M."

// Exercise 3: swapCase

function swapCase(str) {
    let result = "";

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === char.toUpperCase()) {
            result += char.toLowerCase();
        } else {
            result += char.toUpperCase();
        }
    }

    return result;
}

console.log(swapCase("The Quick Brown Fox"));
// → "tHE qUICK bROWN fOX"

console.log(swapCase("Hello World"));
// → "hELLO wORLD"

// Exercise 4: isOmnipresent
function isOmnipresent(arr, value) {
    for (let i = 0; i < arr.length; i++) {
        let found = false;

        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] === value) {
                found = true;
                break;
            }
        }

        // If value was not found in this subarray, it is not omnipresent
        if (!found) return false;
    }

    return true;
}

console.log(isOmnipresent([
    [3, 4],
    [8, 3, 2],
    [3],
    [9, 3],
    [5, 3],
    [4, 3]
], 3)); // true
console.log(isOmnipresent([
    [1, 1],
    [1, 3],
    [5, 1],
    [6, 1]
], 1)); // true
console.log(isOmnipresent([
    [1, 1],
    [1, 3],
    [5, 1],
    [6, 1]
], 6)); // false