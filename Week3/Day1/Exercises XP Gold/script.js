// Exercise 1: Divisible by Three
let numbers = [123, 8409, 100053, 333333333, 7];

for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i] % 3 === 0);
}

// Output:
// true
// true
// true
// true
// false

// Exercise 2: Attendance
let guestList = {
    randy: "Germany",
    karla: "France",
    wendy: "Japan",
    norman: "England",
    sam: "Argentina"
};

let name = prompt("What is your name?").toLowerCase();

if (name in guestList) {
    console.log(`Hi! I'm ${name}, and I'm from ${guestList[name]}.`);
} else {
    console.log("Hi! I'm a guest.");
}

// Exercise 3: Playing with Numbers
let age = [20, 5, 12, 43, 98, 55];

// 1. Sum
let sum = 0;
for (let i = 0; i < age.length; i++) {
    sum += age[i];
}
console.log("Sum:", sum); // 233

// 2. Highest value
let highest = age[0];
for (let i = 1; i < age.length; i++) {
    if (age[i] > highest) {
        highest = age[i];
    }
}
console.log("Highest age:", highest); // 98