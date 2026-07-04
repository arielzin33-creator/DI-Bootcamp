const promptSync = require('prompt-sync')();

function validateFullName(fullName) {
    // ^ and $ anchor the match to the start/end of the string (no extra characters allowed)
    // [A-Z][a-z]+ requires one uppercase letter followed by one or more lowercase letters
    // \s (exactly one space) separates the two name parts
    const nameRegex = /^[A-Z][a-z]+\s[A-Z][a-z]+$/;

    return nameRegex.test(fullName);
}

// Prompt the user
const userInput = promptSync('Enter your full name (e.g. John Doe): ');

if (validateFullName(userInput)) {
    console.log(`"${userInput}" is a valid full name.`);
} else {
    console.log(`"${userInput}" is NOT a valid full name. Please make sure:`);
    console.log('- It contains only letters');
    console.log('- It has exactly one space between first and last name');
    console.log('- The first letter of each name is capitalized');
}

console.log(validateFullName('John Doe')); // true
console.log(validateFullName('john doe')); // false -> lowercase first letters
console.log(validateFullName('John  Doe')); // false -> two spaces
console.log(validateFullName('John Doe3')); // false -> contains a digit
console.log(validateFullName('JohnDoe')); // false -> no space at all