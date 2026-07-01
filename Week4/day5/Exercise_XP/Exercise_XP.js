// Exercise 1: Comparison
function compareToTen(num) {
    return new Promise((resolve, reject) => {
        if (num <= 10) {
            resolve(num);
        } else {
            reject(`${num} is greater than 10`);
        }
    });
}

// Test
compareToTen(15)
    .then(result => console.log(result))
    .catch(error => console.log(error)); // logs: "15 is greater than 10"

compareToTen(8)
    .then(result => console.log(result)) // logs: 8
    .catch(error => console.log(error));


// Exercise 2: Promises
function delayedSuccess() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("success");
        }, 4000);
    });
}

// Test
delayedSuccess().then(result => console.log(result)); // logs "success" after 4s


// Exercise 3: Resolve & Reject
const resolvedPromise = Promise.resolve(3);
const rejectedPromise = Promise.reject("Boo!");

// Test
resolvedPromise.then(value => console.log(value)); // logs: 3

rejectedPromise.catch(error => console.log(error)); // logs: "Boo!"

// Exercise 4:

// ============================================
// JavaScript Promises - Quick Quiz
// ============================================

// -------------------------------------------------
// Q1: What are 2 native functions to run code
//     asynchronously in JavaScript?
// -------------------------------------------------
// A1:
setTimeout(() => {
    console.log("Runs asynchronously after a delay");
}, 1000);

setInterval(() => {
    console.log("Runs asynchronously on repeat");
}, 1000);

// Other valid examples (not required, but also correct):
// - setImmediate()      -> Node.js only
// - requestAnimationFrame() -> browser only
// - fetch() / Promise-based APIs


// -------------------------------------------------
// Q2: What is the output of the code below?
// -------------------------------------------------
let fs = require('fs');

console.log('1');

fs.readFile('test.txt', 'utf8', function(error, data) {
    if (error) {
        throw error;
    }

    console.log('2');
});

console.log('3');

// A2: Output order:
// 1
// 3
// 2
//
// Explanation:
// - console.log('1') runs immediately (synchronous)
// - fs.readFile is asynchronous: it starts the file read
//   in the background and does NOT block execution
// - console.log('3') runs next (still synchronous code)
// - Once the file finishes reading, the callback fires
//   on a later event loop turn, logging '2' last


// -------------------------------------------------
// Q3: What is the function to stop an interval timer?
// -------------------------------------------------
// A3:
const intervalId = setInterval(() => {
    console.log("ticking...");
}, 1000);

clearInterval(intervalId); // stops the interval