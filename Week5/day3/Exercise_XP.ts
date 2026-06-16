//Exercise 1: Hello, World! Program
const phrase = (word1: string, word2: string): string => {
  const result = `${word1} ${word2}`;
  console.log(result);
  return result;}


phrase("Hello", "World"); // logs: "Hello World"

//Exercise 2: Type Annotations

let age: number = 3

let name1: string = 'Ariel'

console.log(`${age} ${name1}`)

//Exercise 3: Union Types

let id: string | number 

id= 13
console.log(id)

id="Hello"
console.log(id)

//Exercise 4: Control Flow with
function numtype (num:number): string{
  if (num > 0) {
    return "positive"
  }
  else if ( num < 0) {
    return "negative"
    }
  else {
    return "zero"
  }
  }

  // Exercise 5: Tuple Types

function getDetails(name: string, age: number): [string, number, string] {
  const greeting = `Hello, ${name}! You are ${age} years old.`;
  return [name, age, greeting];
}

  // Call the function and log the tuple
  const details = getDetails("Alice", 25);
  // Expected output
  console.log(details); // Output: ['Alice', 25, 'Hello, Alice! You are 25 years old.']

  //Exercise 6: Object Type Annotations

type person = {
  name3: string; 
  age: number
}

function createPerson (name3: string, age: number): person {
  return {name3, age}
}

const person = createPerson("Alice", 25)
console.log(person)

//Exercise 7: Type Assertions

const inputElement = document.getElementById("username")

const typedInput = inputElement as HTMLInputElement

typedInput.value = "Alice"
console.log (typedInput.value)

//Exercise 8: switch Statement with Complex Conditions

function getAction (userRole: string){
  switch (userRole) {
    case "admin":
      console.log("Manage users and settings")
      break
    case "editor":
      console.log("Edit content")
      break
    case "viewer":
      console.log("View content")
      break
    case "guest":
      console.log("Limited access")
      break
    case "unknown":
      console.log("Invalid role")
      break
     default:
      console.log("Invalid command");
  }
}

// Test the function with different roles
console.log(getAction("admin")); // Output: Manage users and settings
console.log(getAction("editor")); // Output: Edit content
console.log(getAction("viewer")); // Output: View content
console.log(getAction("guest")); // Output: Limited access
console.log(getAction("unknown")); // Output: Invalid role

//Exercise 9: Function Overloading with Default Parameters
// Overload signatures
function greet(name: string): string;
function greet(): string;

// Implementation
function greet(name?: string): string {
  if (name) {
    return `Hello, ${name}!`;
  }
  return "Greetings!";
}

console.log(greet("Alice")); // Output: "Hello, Alice!"
console.log(greet());        // Output: "Greetings!"

