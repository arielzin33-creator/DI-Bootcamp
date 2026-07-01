/* ═══════════════════════════════════════════════════════════════════════════
   QUESTION 1 — Clean the Room
   ═══════════════════════════════════════════════════════════════════════════

   APPROACH (thinking like a programmer):
     1. Separate the input into two buckets: numbers and strings.
     2. Sort each bucket numerically (or lexicographically for strings).
     3. Group consecutive equal values: if a value appears more than once,
        wrap those occurrences in an array; if it appears exactly once,
        leave it as a plain value.
     4. Return numbers group first, then strings group (bonus).
*/

function cleanRoom(arr) {

  // ── Step 1: separate numbers from strings ──────────────────────────────
  const nums    = arr.filter(x => typeof x === 'number');
  const strings = arr.filter(x => typeof x === 'string');

  // ── Step 2: sort each group ─────────────────────────────────────────────
  nums.sort((a, b) => a - b);
  strings.sort();

  // ── Step 3: group equal values ──────────────────────────────────────────
  function groupEqual(sorted) {
    const result = [];
    let i = 0;

    while (i < sorted.length) {
      const current = sorted[i];
      const group   = [];

      // Collect all consecutive identical values
      while (i < sorted.length && sorted[i] === current) {
        group.push(sorted[i]);
        i++;
      }

      // Single occurrence → plain value; multiple → array
      if (group.length === 1) {
        result.push(group[0]);
      } else {
        result.push(group);
      }
    }

    return result;
  }

  const groupedNums    = groupEqual(nums);
  const groupedStrings = groupEqual(strings);

  // ── Step 4: combine (bonus: numbers first, strings after) ──────────────
  if (strings.length === 0) return groupedNums;
  if (nums.length    === 0) return groupedStrings;
  return [groupedNums, groupedStrings];
}

// ── Tests ─────────────────────────────────────────────────────────────────
console.log('Q1 — numbers only:');
console.log(cleanRoom([1,2,4,591,392,391,2,5,10,2,1,1,1,20,20]));
// → [[1,1,1,1],[2,2,2],4,5,10,[20,20],391,392,591]

console.log('Q1 — bonus (mixed types):');
console.log(cleanRoom([1, "2", "3", 2]));
// → [ [1,2], ["2","3"] ]


/* ═══════════════════════════════════════════════════════════════════════════
   QUESTION 2 — Two-Sum
   ═══════════════════════════════════════════════════════════════════════════

   APPROACH:
     A naïve solution checks every pair (O(n²)).
     A better solution uses a Set for O(n) time:
       - Walk through the array.
       - For each number, calculate the "complement": target − current.
       - If the complement is already in the Set, we found our pair.
       - Otherwise, add the current number to the Set and move on.

   This works because we only need to find ONE pair, and a Set lookup is O(1).
*/

function twoSum(arr, target) {
  const seen = new Set(); // stores numbers we have already visited

  for (let i = 0; i < arr.length; i++) {
    const current    = arr[i];
    const complement = target - current;

    if (seen.has(complement)) {
      // Found the pair — return smaller value first for readability
      return [Math.min(current, complement), Math.max(current, complement)];
    }

    seen.add(current);
  }

  return null; // no pair found
}

// ── Tests ─────────────────────────────────────────────────────────────────
console.log('\nQ2 — Two-Sum:');
console.log(twoSum([1, 2, 3], 4));       // → [1, 3]
console.log(twoSum([1, 2, 3, 9], 10));   // → [1, 9]
console.log(twoSum([1, 2, 3], 99));      // → null (no pair)
console.log(twoSum([3, 5, 2, 8], 10));   // → [2, 8]


/* ═══════════════════════════════════════════════════════════════════════════
   QUESTION 3 — HEX ↔ RGB auto-converter
   ═══════════════════════════════════════════════════════════════════════════

   APPROACH:
     1. Detect the format with regex:
          HEX:  starts with # followed by 3 or 6 hex digits
          RGB:  matches rgb(r, g, b)  or  r,g,b  (loose format)
     2. Convert in the appropriate direction.

   HEX → RGB:
     - Strip the '#'
     - Expand shorthand (3-digit) to 6 digits: "abc" → "aabbcc"
     - Parse each pair of hex digits with parseInt(str, 16)
     - Return "rgb(r, g, b)"

   RGB → HEX:
     - Extract the three numbers
     - Convert each to hex with .toString(16), zero-pad to 2 digits
     - Prepend '#' and return
*/

function colorConvert(input) {
  const str = input.trim();

  // ── Detect HEX ─────────────────────────────────────────────────────────
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  if (hexRegex.test(str)) {
    return hexToRgb(str);
  }

  // ── Detect RGB  (accepts "rgb(255,0,0)" or "255,0,0") ─────────────────
  const rgbRegex = /^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i;
  const rgbMatch = str.match(rgbRegex);

  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);

    // Validate each channel is in 0–255
    if ([r, g, b].every(v => v >= 0 && v <= 255)) {
      return rgbToHex(r, g, b);
    }
  }

  return 'Invalid color format';
}

// ── HEX → RGB ──────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  let clean = hex.replace('#', '');

  // Expand shorthand: "abc" → "aabbcc"
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}

// ── RGB → HEX ──────────────────────────────────────────────────────────────
function rgbToHex(r, g, b) {
  // toString(16) converts to hex; padStart ensures 2 digits (e.g. 9 → "09")
  const toHex = n => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ── Tests ─────────────────────────────────────────────────────────────────
console.log('\nQ3 — Color converter:');
console.log(colorConvert('#ff6347'));          // → rgb(255, 99, 71)
console.log(colorConvert('#fff'));             // → rgb(255, 255, 255)  (shorthand)
console.log(colorConvert('rgb(255, 99, 71)')); // → #ff6347
console.log(colorConvert('255, 99, 71'));      // → #ff6347  (loose format)
console.log(colorConvert('#000000'));          // → rgb(0, 0, 0)
console.log(colorConvert('rgb(0, 0, 0)'));     // → #000000
console.log(colorConvert('hello'));            // → Invalid color format
