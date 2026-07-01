// Exercise 1 : List of people
// review about arrays

const people = ["Greg", "Mary", "Devon", "James"]
console.log(people)
people.shift()
console.log(people)

people.splice(2, 1, "Jason")
console.log(people)

people.push("Ariel")
console.log(people)

console.log(people.indexOf("Mary"))

console.log(people.slice(1, 3))

console.log(people.indexOf("Foo"))

const last = people[people.length - 1]
console.log(last)

//part 2 - loops

for (let i = 0; i < people.length; i++) {
    console.log(people[i])
}

for (let i = 0; i < people.length; i++) {
    console.log(people[i])
    if (people[i] === "Devon") {
        break
    }
}
// Exercise 2 : Your favorite colors
const colors = ["Blue", "Gold", "White", "Grey", "Orange"]
for (let i = 0; i < colors.length; i++) {
    console.log("My #" + (i + 1) + " choice is " + colors[i])
}

// Exercise 3 : Repeat the question
const userNumber = prompt('Please enter a number:')
console.log(numberCheck = typeof(userNumber))

const num = Number(userNumber)

do {
    if (isNaN(num) || num < 10) {
        input = prompt("Number must be 10 or greater. Try again:")
        num = Number(input)
    }
} while (num < 10)

console.log(`You entered ${num}. Done!`)

//Exercise 4 : Building Management
const building = {
    numberOfFloors: 4,
    numberOfAptByFloor: {
        firstFloor: 3,
        secondFloor: 4,
        thirdFloor: 9,
        fourthFloor: 2,
    },
    nameOfTenants: ["Sarah", "Dan", "David"],
    numberOfRoomsAndRent: {
        sarah: [3, 990],
        dan: [4, 1000],
        david: [1, 500],
    },
};

// 2. Number of floors
console.log(building.numberOfFloors); // 4

// 3. Apartments on floor 1 and floor 3
console.log(building.numberOfAptByFloor.firstFloor); // 3
console.log(building.numberOfAptByFloor.thirdFloor); // 9

// 4. Name and room count of the second tenant
const secondTenant = building.nameOfTenants[1]; // "Dan"
console.log(secondTenant);
console.log(building.numberOfRoomsAndRent[secondTenant.toLowerCase()][0]); // 4

// 5. Compare rents: if Sarah + David's rent > Dan's rent, raise Dan's rent to 1200
const sarahRent = building.numberOfRoomsAndRent.sarah[1];
const davidRent = building.numberOfRoomsAndRent.david[1];
const danRent = building.numberOfRoomsAndRent.dan[1];

if (sarahRent + davidRent > danRent) {
    building.numberOfRoomsAndRent.dan[1] = 1200;
}
console.log(building.numberOfRoomsAndRent.dan); // [4, 1200]

//Exercise 5 : Family

const family = {
    father: "Michael",
    mother: "Elena",
    brother: "Tom",
    sister: "Anna",
};

// 2. Log the keys
for (const key in family) {
    console.log(key);
}

// 3. Log the values
for (const key in family) {
    console.log(family[key]);
}

//Exercise 6 : Rudolf

const details = {
    my: "name",
    is: "Rudolf",
    the: "reindeer",
};

// Using a for loop (not for...in) with Object.keys/Object.values
const detailKeys = Object.keys(details);
let sentence = "";

for (let i = 0; i < detailKeys.length; i++) {
    sentence += details[detailKeys[i]] + " ";
}

console.log(sentence.trim()); // "name Rudolf reindeer"

// Note: the object's VALUES already spell out the sentence in order
// ("name", "Rudolf", "reindeer"), so joining them directly gives:
// "name Rudolf reindeer" — the exercise's expected phrase
// "my name is Rudolf the reindeer" is actually formed by the KEYS + VALUES
// alternating. Here is that version instead, using a for loop:

let fullSentence = "";
for (let i = 0; i < detailKeys.length; i++) {
    const key = detailKeys[i];
    fullSentence += `${key} ${details[key]} `;
}
console.log(fullSentence.trim()); // "my name is Rudolf the reindeer"

//Exercise 7 : Secret Group

const names = ["Jack", "Philip", "Sarah", "Amanda", "Bernard", "Kyle"];

// Get the first letter of each name, sort alphabetically, join into a string
const secretSociety = names
    .map((name) => name[0]) // first letter of each name
    .sort() // alphabetical sort
    .join(""); // combine into one string

console.log(secretSociety); // "ABJKPS"