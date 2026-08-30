// Daily Challenge: Star Pattern
// Solution 1: Single Loop
let row = "";

for (let i = 1; i <= 6; i++) {
    row += "* ";
    console.log(row.trimEnd());
}

// Solution 2: Nested Loops
for (let i = 1; i <= 6; i++) {
    let row = "";
    for (let j = 1; j <= i; j++) {
        row += "* ";
    }
    console.log(row.trimEnd());
}