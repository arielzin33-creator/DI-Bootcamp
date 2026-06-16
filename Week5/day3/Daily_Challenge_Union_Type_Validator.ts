//Daily Challenge: Union Type Validator


function validateUnionType(value: any, allowedTypes: string[]): boolean {
  return allowedTypes.includes(typeof value);
}

// Test variables
const num = 42;
const str = "Hello";
const bool = true;
const obj = { name: "Alice" };

console.log(validateUnionType(num, ["number", "string"]));  // true
console.log(validateUnionType(str, ["number", "string"]));  // true
console.log(validateUnionType(bool, ["number", "string"])); // false
console.log(validateUnionType(obj, ["number", "string"]));  // false