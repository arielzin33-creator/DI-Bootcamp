//Exercise 1: Intersection Types

type Person = {
  name: string;
  age: number;
};

type Address = {
  street: string;
  city: string;
};

// Intersection type: combines ALL properties from both Person and Address
type PersonWithAddress = Person & Address;

// Demonstration
const resident: PersonWithAddress = {
  name: "Camille Rousseau",
  age: 34,
  street: "12 Rue de Rivoli",
  city: "Paris"
};

console.log(resident);
// { name: 'Camille Rousseau', age: 34, street: '12 Rue de Rivoli', city: 'Paris' }

//Exercise 2: Type Guards with Union Types

function describeValue(value: number | string): string {
  // typeof is the type guard here — it narrows the union to a specific type
  if (typeof value === "number") {
    return "This is a number";
  } else {
    return "This is a string";
  }
}

// Demonstration
console.log(describeValue(42));        // This is a number
console.log(describeValue("hello"));   // This is a string
console.log(describeValue(3.14));      // This is a number

//Exercise 3: Type Casting

let someValue: any = "Hello, TypeScript!";

// Type casting / assertion using "as" syntax
let strLength: number = (someValue as string).length;

console.log(someValue as string);      // Hello, TypeScript!
console.log(strLength);                // 19
console.log((someValue as string).toUpperCase()); // HELLO, TYPESCRIPT!

//Exercise 4: Type Assertions with Union Types

function getFirstElement(arr: (number | string)[]): string {
  // Type assertion: we assert the first element as a string
  const first = arr[0] as string;
  return first;
}

// Demonstration
console.log(getFirstElement(["apple", 2, "banana"])); // "apple"
console.log(getFirstElement([10, "orange", 5]));       // 10  (see note below)

//Exercise 5: Generic Constraints

interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(value: T): void {
  console.log(`Length: ${value.length}`);
}

// Demonstration
logLength("Hello, world!");        // Length: 13
logLength([1, 2, 3, 4, 5]);        // Length: 5
logLength(["a", "b", "c"]);        // Length: 3
logLength({ length: 42, unit: "cm" }); // Length: 42 -> any object with a numeric 'length' property works

// logLength(100);
// Error: Argument of type 'number' is not assignable to parameter of type 'HasLength'.
// (numbers don't have a 'length' property)

//Exercise 6: Intersection Types and Type Guards

type Person = {
  name: string;
  age: number;
};

type Job = {
  position: string;
  department: string;
};

type Employee = Person & Job;

function describeEmployee(employee: Employee): string {
  // Type guard based on the value of 'position' to distinguish job types
  if (employee.position.toLowerCase() === "manager") {
    return `${employee.name} is a Manager overseeing the ${employee.department} department.`;
  } else if (employee.position.toLowerCase() === "developer") {
    return `${employee.name} is a Developer working in the ${employee.department} department.`;
  } else {
    return `${employee.name} works as a ${employee.position} in the ${employee.department} department.`;
  }
}

// Demonstration
const manager1: Employee = {
  name: "Farid Haddad",
  age: 41,
  position: "Manager",
  department: "Engineering"
};

const developer1: Employee = {
  name: "Yuki Tanaka",
  age: 28,
  position: "Developer",
  department: "Engineering"
};

console.log(describeEmployee(manager1));
// Farid Haddad is a Manager overseeing the Engineering department.

console.log(describeEmployee(developer1));
// Yuki Tanaka is a Developer working in the Engineering department.

//Exercise 7: Type Assertions and Generic Constraints

interface Stringifiable {
  toString(): string;
}

function formatInput<T extends Stringifiable>(value: T): string {
  // Type assertion: treat the result of toString() explicitly as a string
  const formatted = value.toString() as string;
  return `Formatted value: ${formatted}`;
}

// Demonstration
console.log(formatInput(123));            // Formatted value: 123
console.log(formatInput("hello"));        // Formatted value: hello
console.log(formatInput(true));           // Formatted value: true
console.log(formatInput([1, 2, 3]));      // Formatted value: 1,2,3
console.log(formatInput({ toString: () => "Custom Object" })); // Formatted value: Custom Object

