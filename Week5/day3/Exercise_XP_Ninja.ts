//Exercise 1: Conditional Types
function mapType (MappedType: any): any {
  if (typeof MappedType === "number"){
    return Math.sqrt(MappedType)
  }
  else {
    return MappedType.length
  }
}

console.log(mapType(1986))
console.log(mapType('Afori'))

//Exercise 2: Keyof and Lookup Types

function getProperty <T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Test object
const user = {
  name: "Alice",
  age: 25,
  address: "123 Main St",
};

// Test the function
console.log(getProperty(user, "name"));    // Output: "Alice"
console.log(getProperty(user, "age"));     // Output: 25
console.log(getProperty(user, "address")); // Output: "123 Main St"

//Exercise 3: Using Interfaces with Numeric Properties in TypeScript

// Define the interface
interface HasNumericProperty {
  [key: string]: number;
}

// Implement the function
function multiplyProperty(
  obj: HasNumericProperty,
  key: string,
  factor: number
): number {
  return obj[key] * factor;
}

// Test objects
const product = {
  price: 100,
  quantity: 5,
  discount: 10,
};

const stats = {
  speed: 80,
  power: 150,
  defense: 60,
};

// Test the function
console.log(multiplyProperty(product, "price", 2));      // Output: 200
console.log(multiplyProperty(product, "quantity", 3));   // Output: 15
console.log(multiplyProperty(product, "discount", 0.5)); // Output: 5
console.log(multiplyProperty(stats, "speed", 1.5));      // Output: 120
console.log(multiplyProperty(stats, "power", 2));        // Output: 300