/* ═══════════════════════════════════════════════════════════════════════════
   EXERCISE — Merge Words (Currying)
   ═══════════════════════════════════════════════════════════════════════════

   HOW IT WORKS:
   - mergeWords(string) returns another function.
   - That returned function checks its argument:
       • If called WITH a word  → recurse: call mergeWords again with the
         accumulated sentence so far + the new word appended.
       • If called with NO argument (nextString === undefined) → stop
         recursing and return the accumulated string as the final result.

   This is CURRYING combined with RECURSION:
   each call peels off one word and returns a new function ready for the next.
*/

// ── Verbose original (for reference) ────────────────────────────────────────

function mergeWords(string) {
    return function(nextString) {
        if (nextString === undefined) {
            return string;                               // base case: return accumulated result
        } else {
            return mergeWords(string + ' ' + nextString); // recursive case: accumulate + recurse
        }
    }
}

// ── Arrow-function (curried) version ────────────────────────────────────────

const mergeWordsArrow = string => nextString =>
    nextString === undefined
        ? string                                         // base case
        : mergeWordsArrow(string + ' ' + nextString);   // recursive case

// ── Tests ────────────────────────────────────────────────────────────────────

// 1. Single word — called with no second argument
console.log(mergeWords('Hello')());
// → 'Hello'

console.log(mergeWordsArrow('Hello')());
// → 'Hello'

// 2. Full sentence
console.log(mergeWords('There')('is')('no')('spoon.')());
// → 'There is no spoon.'

console.log(mergeWordsArrow('There')('is')('no')('spoon.')());
// → 'There is no spoon.'

// 3. Extra examples
console.log(mergeWordsArrow('I')('love')('JavaScript')());
// → 'I love JavaScript'

console.log(mergeWordsArrow('One')());
// → 'One'
