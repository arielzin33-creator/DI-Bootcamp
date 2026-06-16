//Exercise 1: Union Types

function processValue (value: string | number): string {
  if (typeof value === "number"){
    return `S${value.toFixed(2)}`
  }
  else {
    return value.split("").reverse().join("")
  }
}

console.log(processValue(100));      // Output: "$100.00"
console.log(processValue(49.5));     // Output: "$49.50"
console.log(processValue("Hello"));  // Output: "olleH"
console.log(processValue("Alice"));  // Output: "ecilA"

//Exercise 2: Array Type Annotations
let totalNum = 0
function sumNumbersInArray (arr: (string | number)[]): number {
  for (const i of arr){
    if (typeof i === "number"){
    totalNum = totalNum + i
  }
}
return totalNum
}

console.log(sumNumbersInArray([1, "hello", 2, "world", 3])); // Output: 6
console.log(sumNumbersInArray([10, "Alice", 20, "Bob", 30])); // Output: 60
console.log(sumNumbersInArray(["a", "b", "c"]));              // Output: 0
console.log(sumNumbersInArray([5, 10, 15, 20]));              // Output: 50

//Exercise 3: Type Aliases

type AdvancedUser = {
  name: string
  age: number
  address? : string
}

function introduceAdvancedUser (user: AdvancedUser): string {
if (user.address !== undefined) {
    return `Hi, my name is ${user.name}, I am ${user.age} years old and I live at ${user.address}.`
  }
  return `Hi, my name is ${user.name}, I am ${user.age} years old.`
}

const userWithAddress: AdvancedUser = {
  name: "Alice",
  age: 25,
  address: "123 Main St",
};

// Test without address
const userWithoutAddress: AdvancedUser = {
  name: "Bob",
  age: 30,
};

console.log(introduceAdvancedUser(userWithAddress));
// Output: "Hi, my name is Alice, I am 25 years old and I live at 123 Main St."

console.log(introduceAdvancedUser(userWithoutAddress));
// Output: "Hi, my name is Bob, I am 30 years old."

//Exercise 4: Optional Parameters

function welcomeUser (name: string, greeting?: string): string {
if (greeting !== undefined) {
    return `Hi, my name is ${name}, ${greeting} to you champion.`
  }
  return `Hi, my name is ${name}, hello to you champion.`
}

console.log(welcomeUser("Ariel", "Hail"))
console.log(welcomeUser("Ariel"))