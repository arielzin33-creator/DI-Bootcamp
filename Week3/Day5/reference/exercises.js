/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 1 — Scope
   ═══════════════════════════════════════════════════════════════════════════ */

// ── #1 ───────────────────────────────────────────────────────────────────────
function funcOne() {
    let a = 5;
    if (a > 1) {
        a = 3; // a is re-assigned inside the if block.
               // Because `let` is block-scoped but this is the SAME variable
               // declared in the function body — the if block does NOT create
               // a new scope for an already-declared `let`.
    }
    alert(`inside the funcOne function ${a}`);
}
// #1.1 Prediction: alert shows 3
// Reason: a starts as 5, condition (5 > 1) is true, so a is re-assigned to 3.
// The if block does not create a new `a`; it mutates the one in funcOne's scope.

// #1.2 — if `const a = 5` is used:
// A TypeError is thrown at `a = 3` because const variables cannot be re-assigned.
// The alert never runs.


// ── #2 ───────────────────────────────────────────────────────────────────────
let a_ex2 = 0; // renamed to avoid re-declaration conflicts in this single file

function funcTwo() {
    a_ex2 = 5; // modifies the GLOBAL variable, no local declaration
}

function funcThree() {
    alert(`inside the funcThree function ${a_ex2}`);
}

// #2.1 Predictions:
//   funcThree()  → alert shows 0   (a_ex2 is still 0; funcTwo hasn't run yet)
//   funcTwo()    → no alert; a_ex2 is now 5
//   funcThree()  → alert shows 5   (a_ex2 was changed by funcTwo)

// #2.2 — if `const a = 0` is used:
// `a = 5` inside funcTwo throws a TypeError because const cannot be re-assigned.


// ── #3 ───────────────────────────────────────────────────────────────────────
function funcFour() {
    window.a = "hello"; // attaches `a` directly to the global (window) object
}

function funcFive() {
    alert(`inside the funcFive function ${a}`); // reads window.a
}

// #3.1 Prediction: alert shows "hello"
// Reason: funcFour sets window.a = "hello". In browsers, window properties
// are accessible as global variables, so funcFive reads "hello".
// NOTE: This works even without a `let/const/var` declaration because
// `window.a` is a property assignment, not a variable declaration.


// ── #4 ───────────────────────────────────────────────────────────────────────
let a_ex4 = 1; // global

function funcSix() {
    let a_ex4 = "test"; // LOCAL variable — shadows the global one
    alert(`inside the funcSix function ${a_ex4}`);
}

// #4.1 Prediction: alert shows "test"
// Reason: the `let a_ex4 = "test"` inside funcSix creates a NEW local variable
// that SHADOWS the outer a_ex4 = 1. The global is untouched.
// After funcSix runs, the global a_ex4 is still 1.

// #4.2 — if `const a = "test"` is used inside funcSix:
// Behaviour is identical — alert still shows "test".
// const just means this local variable cannot be re-assigned later in funcSix.
// No error is thrown because we are only declaring and not re-assigning it.


// ── #5 ───────────────────────────────────────────────────────────────────────
let a_ex5 = 2; // outer scope

if (true) {
    let a_ex5 = 5; // NEW block-scoped variable; shadows outer a_ex5
    // alert(`in the if block ${a_ex5}`); // would show: 5
}
// alert(`outside of the if block ${a_ex5}`); // would show: 2

// #5.1 Predictions:
//   Alert inside the if block  → 5   (the inner block-scoped `let`)
//   Alert outside the if block → 2   (the outer `let` is unchanged)

// #5.2 — if `const a = 5` is used inside the if block:
// Behaviour is identical — both alerts show the same values (5 then 2).
// const is also block-scoped, so it shadows the outer variable just like `let`.
// The only difference: the inner const cannot be re-assigned within that block.


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 2 — Ternary operator
   ═══════════════════════════════════════════════════════════════════════════ */

// Original function converted to an arrow function
const winBattle = () => true;

// Ternary: if winBattle() is true → 10, else → 1
const experiencePoints = winBattle() ? 10 : 1;

console.log(experiencePoints); // 10


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 3 — Is it a string?
   ═══════════════════════════════════════════════════════════════════════════ */

// typeof returns the primitive type as a string.
// "string" === "string" → true; anything else → false.
const isString = (value) => typeof value === 'string';

console.log(isString('hello'));     // true
console.log(isString([1, 2, 4, 0])); // false
console.log(isString(42));          // false
console.log(isString(true));        // false


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 4 — Find the sum (one-line arrow function)
   ═══════════════════════════════════════════════════════════════════════════ */

const sum = (a, b) => a + b;

console.log(sum(3, 7));  // 10
console.log(sum(0, -5)); // -5


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 5 — Kg to grams
   ═══════════════════════════════════════════════════════════════════════════ */

// 1. Function DECLARATION
function kgToGramsDeclared(kg) {
    return kg * 1000;
}
console.log(kgToGramsDeclared(2)); // 2000

// 2. Function EXPRESSION
const kgToGramsExpression = function(kg) {
    return kg * 1000;
};
console.log(kgToGramsExpression(3)); // 3000

// Difference:
// Function declarations are HOISTED — you can call them before they appear in the code.
// Function expressions are NOT hoisted — the variable exists but is undefined until that line runs.

// 3. One-line arrow function
const kgToGrams = (kg) => kg * 1000;
console.log(kgToGrams(5)); // 5000


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 6 — Fortune teller (self-invoking / IIFE)
   ═══════════════════════════════════════════════════════════════════════════ */

(function(numberOfChildren, partnerName, location, jobTitle) {
    const sentence = `You will be a ${jobTitle} in ${location}, and married to ${partnerName} with ${numberOfChildren} kids.`;

    // Display in the DOM
    const p = document.createElement('p');
    p.textContent = sentence;
    p.style.cssText = 'font-family:sans-serif; padding:12px; background:#f0f4ff; border-left:4px solid #4361ee; margin:8px;';
    document.body.appendChild(p);

    console.log(sentence);
})(3, 'Sarah', 'Paris', 'Software Engineer');


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 7 — Welcome (self-invoking, adds to Navbar)
   ═══════════════════════════════════════════════════════════════════════════ */

// HTML should contain: <nav id="navbar"></nav>
// This IIFE finds the navbar and injects the welcome div.

(function(userName) {
    const navbar = document.getElementById('navbar');
    if (!navbar) return; // guard: navbar must exist in the HTML

    const welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 16px; font-family:sans-serif;';

    // Profile picture (placeholder avatar using the user's initial)
    const avatar = document.createElement('div');
    avatar.textContent = userName.charAt(0).toUpperCase();
    avatar.style.cssText = [
        'width:36px', 'height:36px', 'border-radius:50%',
        'background:#4361ee', 'color:#fff',
        'display:flex', 'align-items:center', 'justify-content:center',
        'font-weight:bold', 'font-size:1rem'
    ].join(';');

    // Welcome text
    const welcomeText = document.createElement('span');
    welcomeText.textContent = `Welcome, ${userName}!`;
    welcomeText.style.cssText = 'font-family:sans-serif; font-weight:600; color:#1a1a2e;';

    welcomeDiv.appendChild(avatar);
    welcomeDiv.appendChild(welcomeText);
    navbar.appendChild(welcomeDiv);
})('John');


/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE 8 — Juice Bar (nested functions)
   ═══════════════════════════════════════════════════════════════════════════ */

// Helper: append a styled sentence to the DOM
function displayOnDOM(text) {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.cssText = 'font-family:sans-serif; padding:10px 14px; background:#fff8e6; border-left:4px solid #f7a824; margin:6px 8px;';
    document.body.appendChild(p);
}

// ── Part I ───────────────────────────────────────────────────────────────────
function makeJuice_partI(size) {

    function addIngredients(ing1, ing2, ing3) {
        displayOnDOM(
            `The client wants a ${size} juice, containing ${ing1}, ${ing2}, ${ing3}.`
        );
    }

    addIngredients('apple', 'ginger', 'lemon'); // invoked ONCE inside outer function
}

makeJuice_partI('medium'); // invoked in global scope


// ── Part II ──────────────────────────────────────────────────────────────────
function makeJuice_partII(size) {
    const ingredients = []; // empty array inside outer function

    function addIngredients(ing1, ing2, ing3) {
        // Push 3 ingredients into the array
        ingredients.push(ing1, ing2, ing3);
    }

    function displayJuice() {
        displayOnDOM(
            `The client wants a ${size} juice, containing ${ingredients.join(', ')}.`
        );
    }

    // Client wants 6 ingredients → addIngredients called TWICE
    addIngredients('mango',      'pineapple', 'coconut');
    addIngredients('lime juice', 'mint',      'ginger');

    displayJuice(); // invoked ONCE
}

makeJuice_partII('large'); // invoked in global scope
