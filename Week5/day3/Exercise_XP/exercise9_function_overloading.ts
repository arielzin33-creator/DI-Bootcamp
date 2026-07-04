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
