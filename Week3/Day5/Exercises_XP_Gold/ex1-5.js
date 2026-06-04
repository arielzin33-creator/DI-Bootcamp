/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 1 — Nested Functions
   ═══════════════════════════════════════════════════════════════════════════

   PREDICTION (before running):
   landscape() will return the string:  "____/''''\____"

   Step-by-step reasoning:
     1. result starts as ""
     2. flat(4)     → appends "_" four times          → result = "____"
     3. mountain(4) → appends "/", then "'" four times,
                       then "\"                        → result = "____/''''\\"
     4. flat(4)     → appends "_" four times           → result = "____/''''\\____"

   The final return value is: "____/''''\\____"
   (In a JS string, "\\" renders as a single backslash character \)
   So visually it prints: ____/''''\ ____

*/

// ── Part 1: Original code (preserved exactly) ────────────────────────────────

let landscape = function() {

    let result = "";

    let flat = function(x) {
        for (let count = 0; count < x; count++) {
            result = result + "_";
        }
    }

    let mountain = function(x) {
        result = result + "/";
        for (let counter = 0; counter < x; counter++) {
            result = result + "'";
        }
        result = result + "\\";
    }

    flat(4);
    mountain(4);
    flat(4);

    return result;
}

console.log(landscape()); // "____/''''\\____"


// ── Part 2: Converted to nested arrow functions ───────────────────────────────

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

console.log(landscapeArrow()); // "____/''''\\____"  — identical output


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 2 — Closure
   ═══════════════════════════════════════════════════════════════════════════

   PREDICTION: addToTen(3) returns 13

   Reasoning:
     const addTo = x => y => x + y;
       → addTo is a function that takes x and RETURNS ANOTHER function.
       → The returned inner function takes y and returns x + y.
       → The outer x is captured in a CLOSURE — it stays alive inside
         the inner function even after addTo(10) has finished executing.

     const addToTen = addTo(10);
       → addToTen is now the inner function  y => 10 + y
       → The value 10 is "closed over" (remembered) in addToTen's scope.

     addToTen(3)
       → Calls  y => 10 + y  with y = 3
       → Returns 10 + 3 = 13

*/

const addTo = x => y => x + y;
const addToTen = addTo(10);

console.log(addToTen(3)); // 13


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 3 — Currying (direct call)
   ═══════════════════════════════════════════════════════════════════════════

   PREDICTION: curriedSum(30)(1) returns 31

   Reasoning:
     const curriedSum = (a) => (b) => a + b;
       → curriedSum is a CURRIED function: instead of taking both arguments
         at once, it takes them one at a time.
       → curriedSum(a) returns a new function  (b) => a + b.

     curriedSum(30)(1)
       → First call  curriedSum(30) returns  (b) => 30 + b
       → Immediately called with (1)  → 30 + 1 = 31

*/

const curriedSum = (a) => (b) => a + b;

console.log(curriedSum(30)(1)); // 31


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 4 — Currying (intermediate variable)
   ═══════════════════════════════════════════════════════════════════════════

   PREDICTION: add5(12) returns 17

   Reasoning:
     const curriedSum = (a) => (b) => a + b;   // same as Exercise 3

     const add5 = curriedSum(5);
       → Calls curriedSum with a = 5
       → add5 is now the inner function  (b) => 5 + b
       → The value 5 is CLOSED OVER inside add5 (same closure mechanism
         as Exercise 2 — only the syntax differs).

     add5(12)
       → Calls  (b) => 5 + b  with b = 12
       → Returns 5 + 12 = 17

   Note: This is functionally identical to Exercise 3 — the only difference
   is that here we STORE the partially-applied function in a variable (add5)
   before calling it, instead of calling it immediately with (30)(1).

*/

const add5 = curriedSum(5);

console.log(add5(12)); // 17


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 5 — Composing
   ═══════════════════════════════════════════════════════════════════════════

   PREDICTION: compose(add1, add5)(10) returns 16

   Reasoning:
     const compose = (f, g) => (a) => f(g(a));
       → compose takes two functions f and g, and returns a NEW function.
       → The new function takes a value a, applies g FIRST, then passes
         the result to f.
       → Order of execution: g runs first, f runs second (right-to-left).

     const add1 = (num) => num + 1;   // adds 1
     const add5 = (num) => num + 5;   // adds 5

     compose(add1, add5)(10)
       → f = add1,  g = add5,  a = 10
       → Step 1: g(a)    = add5(10)  = 10 + 5 = 15
       → Step 2: f(g(a)) = add1(15)  = 15 + 1 = 16

*/

const compose = (f, g) => (a) => f(g(a));
const add1    = (num) => num + 1;
const add5_compose = (num) => num + 5; // renamed to avoid conflict with Ex.4

console.log(compose(add1, add5_compose)(10)); // 16
