// EXERCISE 1 — Nested Functions

// --- Prediction ---
// flat(4)      -> adds four "_"          => result = "____"
// mountain(4)  -> adds "/", four "'", then "\"
//                 => result = "____/''''\"
// flat(4)      -> adds four more "_"
//                 => result = "____/''''\____"
//
// Final output: "____/''''\____"

let landscape = function() {
    let result = "";

    let flat = function(x) {
        for (let count = 0; count < x; count++) {
            result = result + "_";
        }
    };

    let mountain = function(x) {
        result = result + "/";
        for (let counter = 0; counter < x; counter++) {
            result = result + "'";
        }
        result = result + "\\";
    };

    flat(4);
    mountain(4);
    flat(4);

    return result;
};

console.log(landscape()); // "____/''''\____"


// --- Rewritten with nested arrow functions ---
const landscapeArrow = () => {
    let result = "";

    const flat = (x) => {
        for (let count = 0; count < x; count++) {
            result = result + "_";
        }
    };

    const mountain = (x) => {
        result = result + "/";
        for (let counter = 0; counter < x; counter++) {
            result = result + "'";
        }
        result = result + "\\";
    };

    flat(4);
    mountain(4);
    flat(4);

    return result;
};

console.log(landscapeArrow()); // "____/''''\____"


// EXERCISE 2 — Closure

// --- Prediction ---
// addTo(10) returns a new function where x is "locked in" as 10
// (this is a closure: the inner function remembers x=10 even after
// addTo has finished running).
// addToTen(3) then runs that inner function with y=3, giving 10+3.
//
// Result: 13

const addTo = (x) => (y) => x + y;
const addToTen = addTo(10);
console.log(addToTen(3)); // 13


// EXERCISE 3 — Currying (direct call)

// --- Prediction ---
// curriedSum(30) returns a function with a=30 fixed via closure.
// Calling that result with (1) computes 30 + 1.
//
// Result: 31

const curriedSum = (a) => (b) => a + b;
console.log(curriedSum(30)(1)); // 31



// EXERCISE 4 — Currying (intermediate variable)

// --- Prediction ---
// curriedSum(5) returns a function with a=5 fixed.
// add5 is now that function, so add5(12) computes 5 + 12.
//
// Result: 17

const curriedSum2 = (a) => (b) => a + b;
const add5 = curriedSum2(5);
console.log(add5(12)); // 17


// EXERCISE 5 — Composing

// --- Prediction ---
// compose(f, g) returns a function that runs g first, then f on the result.
// compose(add1, add5)(10):
//   1. g = add5, so add5(10) = 15
//   2. f = add1, so add1(15) = 16
//
// Result: 16

const compose = (f, g) => (a) => f(g(a));
const add1 = (num) => num + 1;
const add5b = (num) => num + 5;
console.log(compose(add1, add5b)(10)); // 16