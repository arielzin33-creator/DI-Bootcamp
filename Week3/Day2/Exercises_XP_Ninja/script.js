//Exercise 1: Random Number

const randomNumber = Math.floor(Math.random() * 100) + 1;
console.log("Random number:", randomNumber);

for (let i = 0; i <= randomNumber; i++) {
    if (i % 2 === 0) {
        console.log(i);
    }
}

// Exercise 2: Capitalized Letters

function capitalize(str) {
    let evenCaps = "";
    let oddCaps = "";

    for (let i = 0; i < str.length; i++) {
        if (i % 2 === 0) {
            evenCaps += str[i].toUpperCase();
            oddCaps += str[i];
        } else {
            evenCaps += str[i];
            oddCaps += str[i].toUpperCase();
        }
    }

    return [evenCaps, oddCaps];
}

console.log(capitalize("abcdef"));
// → ["AbCdEf", "aBcDeF"]

console.log(capitalize("javascript"));
// → ["JaVaScRiPt", "jAvAsCrIpT"]

// Exercise 3: Is Palindrome?

function isPalindrome(str) {
    // Normalize: lowercase and remove non-letter characters
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");

    let reversed = "";
    for (let i = cleaned.length - 1; i >= 0; i--) {
        reversed += cleaned[i];
    }

    return cleaned === reversed;
}

console.log(isPalindrome("madam")); // true
console.log(isPalindrome("kayak")); // true
console.log(isPalindrome("bob")); // true
console.log(isPalindrome("A man a plan a canal Panama")); // true
console.log(isPalindrome("hello")); // false

// Exercise 4: Biggest Number

function biggestNumberInArray(arrayNumber) {
    if (arrayNumber.length === 0) return 0;

    let biggest = null;

    for (let i = 0; i < arrayNumber.length; i++) {
        const current = arrayNumber[i];

        // Skip non-numeric values
        if (typeof current !== "number") continue;

        if (biggest === null || current > biggest) {
            biggest = current;
        }
    }

    // If no numbers were found in the array, return 0
    return biggest === null ? 0 : biggest;
}

const array = [-1, 0, 3, 100, 99, 2, 99];
const array2 = ['a', 3, 4, 2];
const array3 = [];

console.log(biggestNumberInArray(array)); // 100
console.log(biggestNumberInArray(array2)); // 4
console.log(biggestNumberInArray(array3)); // 0

// Exercise 5: Unique Elements

function uniqueElements(arr) {
    const result = [];

    for (let i = 0; i < arr.length; i++) {
        let isDuplicate = false;

        for (let j = 0; j < result.length; j++) {
            if (result[j] === arr[i]) {
                isDuplicate = true;
                break;
            }
        }

        if (!isDuplicate) {
            result.push(arr[i]);
        }
    }

    return result;
}

console.log(uniqueElements([1, 2, 3, 3, 3, 3, 4, 5]));
// → [1, 2, 3, 4, 5]

console.log(uniqueElements([5, 5, 5, 1, 2]));
// → [5, 1, 2]