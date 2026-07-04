function validateUnionType(value: any, allowedTypes: string[]): boolean {
  const valueType = typeof value;

  // Loop through the allowed types to see if the value's type matches any of them
  for (let i = 0; i < allowedTypes.length; i++) {
    if (allowedTypes[i] === valueType) {
      return true;
    }
  }

  return false;
}

// Demonstration / usage

let age: any = 25;
let name1: any = "Alice";
let isActive: any = true;
let data: any = { id: 1 };
let notDefined: any = undefined;

console.log(validateUnionType(age, ["number", "string"]));       // true  -> 25 is a number
console.log(validateUnionType(name1, ["number", "string"]));      // true  -> "Alice" is a string
console.log(validateUnionType(isActive, ["number", "string"]));  // false -> boolean is not in the list
console.log(validateUnionType(isActive, ["boolean"]));           // true  -> boolean is in the list
console.log(validateUnionType(data, ["object", "number"]));      // true  -> data is an object
console.log(validateUnionType(notDefined, ["undefined"]));       // true  -> matches "undefined"
console.log(validateUnionType(notDefined, ["string", "number"])); // false -> no match