//Exercise 1: Class with Access Modifiers

class Employee {
  private name: string;
  private salary: number;
  public position: string;
  protected department: string;

  constructor(name: string, salary: number, position: string, department: string) {
    this.name = name;
    this.salary = salary;
    this.position = position;
    this.department = department;
  }

  public getEmployeeInfo(): string {
    return `Employee: ${this.name}, Position: ${this.position}`;
  }
}

// Demonstration
const employee1 = new Employee("Laura Bennett", 55000, "Software Engineer", "Engineering");
console.log(employee1.getEmployeeInfo()); // Employee: Laura Bennett, Position: Software Engineer

console.log(employee1.position); // "Software Engineer" -> accessible (public)

// employee1.name;        // Error: Property 'name' is private and only accessible within class 'Employee'.
// employee1.salary;      // Error: Property 'salary' is private and only accessible within class 'Employee'.
// employee1.department;  // Error: Property 'department' is protected and only accessible within class 'Employee' and its subclasses.

//Exercise 2: Readonly Properties in a Class

class Product {
  readonly id: number;
  public name: string;
  public price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  public getProductInfo(): string {
    return `Product: ${this.name}, Price: $${this.price}`;
  }
}

// Demonstration
const product1 = new Product(101, "Wireless Mouse", 25.99);
console.log(product1.getProductInfo()); // Product: Wireless Mouse, Price: $25.99

// Attempting to modify the readonly property:
// product1.id = 202;
// Error (TypeScript compile-time): Cannot assign to 'id' because it is a read-only property.

//Exercise 3: Class Inheritance

class Animal {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  public makeSound(): string {
    return `${this.name} makes a generic animal sound.`;
  }
}

class Dog extends Animal {
  public makeSound(): string {
    return `${this.name} says: Bark!`;
  }
}

// Demonstration
const myDog = new Dog("Rex");
console.log(myDog.makeSound()); // Rex says: Bark!

//Exercise 4: Static Properties and Methods

class Calculator {
  static add(a: number, b: number): number {
    return a + b;
  }

  static subtract(a: number, b: number): number {
    return a - b;
  }
}

// Demonstration — called directly on the class, no instance needed
console.log(Calculator.add(10, 5));      // 15
console.log(Calculator.subtract(10, 5)); // 5

//Exercise 5: Extending Interfaces with Optional and Readonly Properties

interface User {
  readonly id: number;
  name: string;
  email: string;
}

interface PremiumUser extends User {
  membershipLevel?: string; // optional property
}

function printUserDetails(user: PremiumUser): void {
  console.log(`ID: ${user.id}`);
  console.log(`Name: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Membership Level: ${user.membershipLevel ?? "Standard (not specified)"}`);
}

// Demonstration
const regularPremiumUser: PremiumUser = {
  id: 1,
  name: "Marc Dubois",
  email: "marc.dubois@example.com"
  // membershipLevel omitted — allowed, since it's optional
};

const goldUser: PremiumUser = {
  id: 2,
  name: "Elena Rossi",
  email: "elena.rossi@example.com",
  membershipLevel: "Gold"
};

printUserDetails(regularPremiumUser);
// ID: 1
// Name: Marc Dubois
// Email: marc.dubois@example.com
// Membership Level: Standard (not specified)

printUserDetails(goldUser);
// ID: 2
// Name: Elena Rossi
// Email: elena.rossi@example.com
// Membership Level: Gold

// regularPremiumUser.id = 99;
// Error: Cannot assign to 'id' because it is a read-only property.