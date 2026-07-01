// ============================================
// Daily Challenge: makeAllCaps() & sortWords()
// ============================================

// -------------------------------------------------
// Function 1: makeAllCaps()
// -------------------------------------------------
function makeAllCaps(arr) {
    return new Promise((resolve, reject) => {
        const allStrings = arr.every(word => typeof word === 'string');

        if (allStrings) {
            const uppercased = arr.map(word => word.toUpperCase());
            resolve(uppercased);
        } else {
            reject('Error: array must contain only strings');
        }
    });
}

// -------------------------------------------------
// Function 2: sortWords()
// -------------------------------------------------
function sortWords(arr) {
    return new Promise((resolve, reject) => {
        if (arr.length > 4) {
            const sorted = [...arr].sort(); // alphabetical order
            resolve(sorted);
        } else {
            reject('Error: array must contain more than 4 words');
        }
    });
}

// -------------------------------------------------
// Tests
// -------------------------------------------------

// 1) catch is executed (1 is not a string -> makeAllCaps rejects)
makeAllCaps([1, "pear", "banana"])
    .then((arr) => sortWords(arr))
    .then((result) => console.log(result))
    .catch(error => console.log(error));
// logs: "Error: array must contain only strings"

// 2) catch is executed (array has only 3 words -> sortWords rejects)
makeAllCaps(["apple", "pear", "banana"])
    .then((arr) => sortWords(arr))
    .then((result) => console.log(result))
    .catch(error => console.log(error));
// logs: "Error: array must contain more than 4 words"

// 3) both resolve -> uppercased & sorted array is logged
makeAllCaps(["apple", "pear", "banana", "melon", "kiwi"])
    .then((arr) => sortWords(arr))
    .then((result) => console.log(result))
    .catch(error => console.log(error));
// logs: ["APPLE", "BANANA", "KIWI", "MELON", "PEAR"]

// ============================================
// 2nd Daily Challenge: Morse Code Translator
// ============================================

const morse = `{
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "a": ".-",
  "b": "-...",
  "c": "-.-.",
  "d": "-..",
  "e": ".",
  "f": "..-.",
  "g": "--.",
  "h": "....",
  "i": "..",
  "j": ".---",
  "k": "-.-",
  "l": ".-..",
  "m": "--",
  "n": "-.",
  "o": "---",
  "p": ".--.",
  "q": "--.-",
  "r": ".-.",
  "s": "...",
  "t": "-",
  "u": "..-",
  "v": "...-",
  "w": ".--",
  "x": "-..-",
  "y": "-.--",
  "z": "--..",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "!": "-.-.--",
  "-": "-....-",
  "/": "-..-.",
  "@": ".--.-.",
  "(": "-.--.",
  ")": "-.--.-"
}`;

// -------------------------------------------------
// Function 1: toJs()
// -------------------------------------------------
function toJs() {
    return new Promise((resolve, reject) => {
        const morseObj = JSON.parse(morse);

        if (Object.keys(morseObj).length === 0) {
            reject('Error: morse object is empty');
        } else {
            resolve(morseObj);
        }
    });
}

// -------------------------------------------------
// Function 2: toMorse(morseJS)
// -------------------------------------------------
function toMorse(morseJS) {
    return new Promise((resolve, reject) => {
        const userInput = prompt('Enter a word or a sentence:');
        const characters = userInput.toLowerCase().split('');

        const morseTranslation = [];

        for (const char of characters) {
            if (char === ' ') {
                // space isn't a key in the morse object;
                // treat it as a word separator rather than an invalid character
                morseTranslation.push(' ');
                continue;
            }

            if (!morseJS.hasOwnProperty(char)) {
                reject(`Error: the character "${char}" doesn't exist in the morse object`);
                return; // stop processing further characters once we reject
            }

            morseTranslation.push(morseJS[char]);
        }

        resolve(morseTranslation);
    });
}

// -------------------------------------------------
// Function 3: joinWords(morseTranslation)
// -------------------------------------------------
function joinWords(morseTranslation) {
    const result = morseTranslation.join('\n');

    console.log(result);

    // Display on the DOM
    const output = document.createElement('pre'); // <pre> preserves line breaks
    output.textContent = result;
    document.body.appendChild(output);

    return result;
}

// -------------------------------------------------
// Chaining the three functions
// -------------------------------------------------
toJs()
    .then((morseJS) => toMorse(morseJS))
    .then((morseTranslation) => joinWords(morseTranslation))
    .catch((error) => console.log(error));

// Example:
// if the user enters "Hello", morseTranslation = ["....", ".", ".-..", ".-..", "---"]
// joinWords displays:
// ....
// .
// .-..
// .-..
// ---