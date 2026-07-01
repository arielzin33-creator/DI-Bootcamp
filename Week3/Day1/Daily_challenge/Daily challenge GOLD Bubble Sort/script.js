//Daily challenge GOLD Bubble Sort

// Part 1: .toString()
const numbers = [5, 0, 9, 1, 7, 4, 2, 6, 3, 8];

const asString = numbers.toString();
console.log(asString); // "5,0,9,1,7,4,2,6,3,8"
console.log(typeof asString); // "string"

// Part 2: .join()
const numbers = [5, 0, 9, 1, 7, 4, 2, 6, 3, 8];

console.log(numbers.join("+")); // "5+0+9+1+7+4+2+6+3+8"
console.log(numbers.join(" ")); // "5 0 9 1 7 4 2 6 3 8"
console.log(numbers.join("")); // "5091742638"
console.log(numbers.join("-")); // "5-0-9-1-7-4-2-6-3-8"
console.log(numbers.join(", ")); // "5, 0, 9, 1, 7, 4, 2, 6, 3, 8"

// Part 3: Bubble Sort (descending order)

const numbers = [5, 0, 9, 1, 7, 4, 2, 6, 3, 8];

// Outer loop: each pass guarantees the smallest remaining
// value "bubbles down" to its correct position at the end
for (let i = 0; i < numbers.length; i++) {

    // Inner loop: compare each pair of adjacent elements
    // We subtract i because the last i elements are already sorted
    for (let j = 0; j < numbers.length - 1 - i; j++) {

        // If the left number is SMALLER than the right, swap them
        // This pushes larger numbers toward the front (descending order)
        if (numbers[j] < numbers[j + 1]) {

            // Store the left value in a temporary variable before overwriting it
            let temp = numbers[j];

            // Place the larger right value into the left position
            numbers[j] = numbers[j + 1];

            // Place the saved left value into the right position
            numbers[j + 1] = temp;
        }
    }

    console.log(`Pass ${i + 1}:`, [...numbers]);
}

console.log("Final sorted array:", numbers);