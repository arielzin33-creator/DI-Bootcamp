//Exercise 1: Combining Intersection Types with Type Guards

interface User {
  name: string;
  email: string;
}

interface Admin {
  adminLevel: number;
}

// Intersection type: combines all properties from both interfaces
type AdminUser = User & Admin;

function getProperty(obj: AdminUser, propertyName: string): unknown {
  // Type guard: 'in' checks whether the key actually exists on the object at runtime
  if (propertyName in obj) {
    // Cast propertyName to a key of AdminUser so TypeScript allows the index access
    return obj[propertyName as keyof AdminUser];
  }
  return undefined;
}

// Demonstration
const adminUser1: AdminUser = {
  name: "Isabelle Moreau",
  email: "isabelle.moreau@example.com",
  adminLevel: 3
};

console.log(getProperty(adminUser1, "name"));        // Isabelle Moreau
console.log(getProperty(adminUser1, "adminLevel"));  // 3
console.log(getProperty(adminUser1, "phoneNumber")); // undefined -> property doesn't exist on AdminUser

//Exercise 2: Type Casting with Generics

function castToType<T>(value: any, constructorFn: (val: any) => T): T {
  return constructorFn(value);
}

// Demonstration
const numberValue = castToType<number>("42", Number);
console.log(numberValue, typeof numberValue); // 42 'number'

const booleanValue = castToType<boolean>("true", (val) => val === "true");
console.log(booleanValue, typeof booleanValue); // true 'boolean'

const booleanValue2 = castToType<boolean>("", Boolean);
console.log(booleanValue2, typeof booleanValue2); // false 'boolean'

//Exercise 3: Type Assertions with Generic Constraints

function getArrayLength<T extends number | string>(items: T[]): number {
  return items.length;
}

// Demonstration
const numberArray: number[] = [10, 20, 30, 40];
const stringArray: string[] = ["apple", "banana", "cherry"];

console.log(getArrayLength(numberArray)); // 4
console.log(getArrayLength(stringArray)); // 3
console.log(getArrayLength([1, 2, 3, 4, 5])); // 5
console.log(getArrayLength(["a", "b"]));       // 2

// getArrayLength([true, false]);
// Error: Type 'boolean' does not satisfy the constraint 'number | string'.

//Exercise 4: Generic Interfaces with Class Implementation

interface Storage<T> {
  add(item: T): void;
  get(index: number): T | undefined;
}

class Box<T> implements Storage<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[index];
  }
}

// Demonstration with numbers
const numberBox = new Box<number>();
numberBox.add(10);
numberBox.add(20);
numberBox.add(30);

console.log(numberBox.get(0)); // 10
console.log(numberBox.get(2)); // 30
console.log(numberBox.get(5)); // undefined -> index out of bounds

// Demonstration with strings
const stringBox = new Box<string>();
stringBox.add("hello");
stringBox.add("world");

console.log(stringBox.get(1)); // world

// Demonstration with a custom object type
interface Book {
  title: string;
  author: string;
}

const bookBox = new Box<Book>();
bookBox.add({ title: "1984", author: "George Orwell" });

console.log(bookBox.get(0)); // { title: '1984', author: 'George Orwell' }

//Exercise 5: Combining Generic Classes with Constraints

interface Item<T> {
  value: T;
}

class Queue<T> {
  private items: Item<T>[] = [];

  add(item: Item<T>): void {
    this.items.push(item);
  }

  remove(): Item<T> | undefined {
    // Removes and returns the item at the front of the queue (FIFO behavior)
    return this.items.shift();
  }

  peek(): Item<T> | undefined {
    return this.items[0];
  }

  size(): number {
    return this.items.length;
  }
}

// Demonstration with numbers
const numberQueue = new Queue<number>();
numberQueue.add({ value: 1 });
numberQueue.add({ value: 2 });
numberQueue.add({ value: 3 });

console.log(numberQueue.size());   // 3
console.log(numberQueue.remove()); // { value: 1 }
console.log(numberQueue.size());   // 2

// Demonstration with strings
const stringQueue = new Queue<string>();
stringQueue.add({ value: "first" });
stringQueue.add({ value: "second" });

console.log(stringQueue.remove()); // { value: 'first' }
console.log(stringQueue.peek());   // { value: 'second' }

// Demonstration with a custom object type
interface Task {
  id: number;
  description: string;
}

const taskQueue = new Queue<Task>();
taskQueue.add({ value: { id: 1, description: "Write report" } });
taskQueue.add({ value: { id: 2, description: "Review code" } });

console.log(taskQueue.remove()); // { value: { id: 1, description: 'Write report' } }