# Technical Exam Answers — Examen 2:1

All code answers below were run in Node.js to confirm the stated output is correct.

## 1. Data types in JavaScript

Seven primitive types — `string`, `number`, `bigint`, `boolean`, `undefined`,
`symbol`, `null` — plus the non-primitive `object` type (which arrays,
functions, and dates are all specializations of).

## 2. `3+2+"7"`

```js
3 + 2 + "7"; // "57"
```

`3 + 2` evaluates first (both numbers) → `5`. Then `5 + "7"`: one operand is a
string, so `+` switches to string concatenation, coercing `5` to `"5"` →
`"57"`.

## 3. `map()` for full names

```js
const array = [
  { first_name: "Colin", last_name: "Toh" },
  { first_name: "Addy", last_name: "Osmani" },
  { first_name: "Yehuda", last_name: "Katz" },
];

const fullNames = array.map((person) => `${person.first_name} ${person.last_name}`);
// ["Colin Toh", "Addy Osmani", "Yehuda Katz"]
```

## 4. Output?

```js
let c = { greeting: "Hey!" };
let d;
d = c;
c.greeting = "Hello";
console.log(d.greeting);
```

**Answer: A — `Hello`**. `d = c` copies the *reference*, not the object — `d`
and `c` point to the same object in memory, so mutating it through `c` is
visible through `d` too.

## 5. Filter even numbers

```js
const numberArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
numberArray.filter((n) => n % 2 === 0); // [2, 4, 6, 8, 10]
```

## 6. Reverse each word

```js
function reverseEachWord(sentence) {
  return sentence
    .split(" ")
    .map((word) => word.split("").reverse().join(""))
    .join(" ");
}

reverseEachWord("Welcome to this Javascript Guide!");
// "emocleW ot siht tpircsavaJ !ediuG"
```

## 7. Check if a value is an array

```js
Array.isArray(value);
```
Not `typeof value === "object"` — arrays are objects too, so `typeof` can't
tell them apart from plain objects.

## 8. What is a Promise?

An object representing the eventual result of an asynchronous operation. It
has three states — pending, fulfilled, rejected — and lets you attach
callbacks without nesting them.

```js
const promise = new Promise((resolve, reject) => {
  const success = true;
  if (success) {
    resolve("done");
  } else {
    reject(new Error("failed"));
  }
});

promise
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

## 9. Capitalize the first letter

```js
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

capitalize("hello world"); // "Hello world"
```

## 10. Output?

```js
const fullName = "Alfred Worse";
fullName = "Albert Full";
console.log(fullName);
```

**Throws `TypeError: Assignment to constant variable.`** — `const` doesn't
make the *value* immutable, but the binding itself can never be reassigned.
Nothing is logged; the script stops at that line.

## 11. Output?

```js
const object = { fullName: "Alfred Worse" };
object.fullName = "Albert Full";
console.log(object);
// { fullName: "Albert Full" }
```

Contrast with Q10: `const` blocks reassigning `object` itself (e.g.
`object = {}`), but mutating a *property* of the object it already points to
is unrelated to that rule and is perfectly legal.

## 12. Output?

```js
const object = { fullName: "Albert Full" };

const object2 = { ...object, fullName: "Albert Full2" };
const object3 = { fullName: "Albert Full2", ...object };

console.log(object2); // { fullName: "Albert Full2" }
console.log(object3); // { fullName: "Albert Full" }
```

Object spread applies key-by-key, left to right, and later keys overwrite
earlier ones — so the position of `...object` relative to the explicit
`fullName` key decides which value wins.

## 13. Output?

```js
const object = {
  fullName: "Alfred Worse",
  city: ["Jerusalem", "Tel Aviv"],
};
object.city.push("Paris");
console.log(object);
// { fullName: "Alfred Worse", city: ["Jerusalem", "Tel Aviv", "Paris"] }
```

## 14. Output?

```js
const object = {
  fullName: "Alfred Worse",
  city: ["Jerusalem", "Tel Aviv"],
};
const newObject = { ...object };
newObject.city.push("Paris");
console.log(object.city);
// ["Jerusalem", "Tel Aviv", "Paris"]
```

Object spread is a **shallow** copy — `newObject` gets its own top-level
properties, but `newObject.city` is the *same array reference* as
`object.city`. Pushing onto it through `newObject` mutates the one array both
objects point to, so `object.city` shows "Paris" too. (Contrast with Q4: this
is that same reference-sharing behavior, just one level deeper.)

## 15. Group anagrams

```js
function groupAnagrams(words) {
  const groups = new Map();
  words.forEach((word) => {
    const key = word.split("").sort().join(""); // canonical form: sorted letters
    const group = groups.get(key) || [];
    group.push(word);
    groups.set(key, group);
  });
  return [...groups.values()];
}

groupAnagrams(["abn", "nab", "def", "poe", "fed"]);
// [["abn", "nab"], ["def", "fed"], ["poe"]]
```

Two words are anagrams exactly when sorting their letters produces the same
string — that sorted string is used as a grouping key.

## 16. Output?

```js
console.log("b");
setTimeout(() => console.log("a"), 0);
console.log("c");
setTimeout(() => console.log("d"), 10);
setTimeout(() => console.log("f"), 0);
```

```
b
c
a
f
d
```

All synchronous code (`console.log("b")`, `console.log("c")`) runs first,
before the event loop even looks at the timer queue. Among the timers, `0ms`
callbacks (`a`, then `f`, in the order they were scheduled) fire before the
`10ms` one (`d`) — `setTimeout(..., 0)` doesn't mean "immediately", it means
"as soon as the current call stack is clear and this timer's delay has
elapsed", so it still queues behind the synchronous code, and shorter delays
still run before longer ones.

## 17. Find the missing number

```js
function findMissing(arr) {
  const n = arr.length + 1;
  const expectedSum = (n * (arr[0] + arr[arr.length - 1])) / 2;
  const actualSum = arr.reduce((sum, x) => sum + x, 0);
  return expectedSum - actualSum;
}

findMissing([1, 2, 3, 4, 6, 7, 8, 9, 10]); // 5
```

Sums a complete run of `n` consecutive integers with the arithmetic-series
formula, then subtracts what's actually in the array — whatever's left over
is the missing value. O(n) time, O(1) space.

## 18. Reverse an integer

```js
function reverseInteger(num) {
  const sign = Math.sign(num);
  const reversed = Number(String(Math.abs(num)).split("").reverse().join(""));
  return sign * reversed;
}

reverseInteger(123);  // 321
reverseInteger(-123); // -321
```

## 19. All permutations

```js
function permute(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  arr.forEach((current, index) => {
    const rest = [...arr.slice(0, index), ...arr.slice(index + 1)];
    permute(rest).forEach((perm) => result.push([current, ...perm]));
  });
  return result;
}

permute([1, 2, 3]);
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

Recursive: fix each element in turn as the first element, then permute
whatever's left and prepend the fixed element to every resulting sub-permutation.

## 20. String "alignment" — can s1 be built from s2's letters?

```js
function canConstruct(s1, s2) {
  const counts = {};
  for (const char of s2) counts[char] = (counts[char] || 0) + 1;
  for (const char of s1) {
    if (!counts[char]) return false;
    counts[char] -= 1;
  }
  return true;
}

canConstruct("ab", "eidbao"); // true  — 'a' and 'b' are both in "eidbao"
canConstruct("aa", "eidbao"); // false — "eidbao" only has one 'a'
```

Note this is character *availability*, not order — `"eidbao"` has `b` before
`a`, so this isn't the classic order-preserving "is s1 a subsequence of s2"
problem (which would say `"ab"` is **not** a subsequence of `"eidbao"`). The
expected outputs only make sense as a multiset/frequency check: does `s2`
contain enough of each letter to spell `s1`, regardless of order — the same
idea as the "ransom note" problem.

## 21. Longest valid parentheses substring

```js
function longestValidParens(s) {
  const stack = [-1]; // seed with -1 as the "base" index before the string starts
  let max = 0;
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === "(") {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i); // no matching '(' — this ')' becomes the new base
      } else {
        max = Math.max(max, i - stack[stack.length - 1]);
      }
    }
  }
  return max;
}

longestValidParens("(()");     // 2
longestValidParens(")()())");  // 4
```

Stack of indices rather than characters: push the index of every `(`; on a
`)`, pop once (closing the top `(`) and, if the stack isn't empty, the new
top is the index just before the current valid run started — so
`i - stack[top]` is that run's length. An empty stack means this `)` has
nothing to match, so it becomes the new base for future runs.
