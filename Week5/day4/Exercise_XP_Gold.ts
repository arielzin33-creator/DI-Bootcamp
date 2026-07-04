//Exercise 1: Class Inheritance with Protected Access Modifiers

class Employee {
  protected name: string;
  protected salary: number;

  constructor(name: string, salary: number) {
    this.name = name;
    this.salary = salary;
  }

  public getDetails(): string {
    return `Name: ${this.name}, Salary: $${this.salary}`;
  }
}

class Manager extends Employee {
  public department: string;

  constructor(name: string, salary: number, department: string) {
    super(name, salary); // must call super() before using 'this' in a derived class
    this.department = department;
  }

  // Override getDetails to include department info
  public getDetails(): string {
    return `${super.getDetails()}, Department: ${this.department}`;
  }
}

// Demonstration
const manager1 = new Manager("Julia Fontaine", 75000, "Operations");
console.log(manager1.getDetails());
// Name: Julia Fontaine, Salary: $75000, Department: Operations

//Exercise 2: Using Readonly with Access Modifiers

class Car {
  public readonly make: string;
  private readonly model: string;
  public year: number;

  constructor(make: string, model: string, year: number) {
    this.make = make;
    this.model = model;
    this.year = year;
  }

  public getCarDetails(): string {
    return `Make: ${this.make}, Model: ${this.model}, Year: ${this.year}`;
  }
}

// Demonstration
const car1 = new Car("Toyota", "Corolla", 2023);
console.log(car1.getCarDetails());
// Make: Toyota, Model: Corolla, Year: 2023

console.log(car1.make); // "Toyota" -> accessible (public)
// console.log(car1.model); // Error: Property 'model' is private and only accessible within class 'Car'.

// Attempting to modify the readonly properties:
// car1.make = "Honda";
// Error: Cannot assign to 'make' because it is a read-only property.

// car1.model = "Civic";
// Error: Cannot assign to 'model' because it is a read-only property.
// (This would actually trigger TWO separate errors if attempted from outside the class:
//  one for being read-only, and one for being private/inaccessible.)

car1.year = 2024; // OK -> 'year' is neither readonly nor private
console.log(car1.getCarDetails());
// Make: Toyota, Model: Corolla, Year: 2024

//Exercise 3: Static Properties and Methods in Classes

class MathUtils {
  static PI: number = 3.14159;

  static circumference(radius: number): number {
    return 2 * MathUtils.PI * radius;
  }
}

// Demonstration — accessed directly on the class, no instance needed
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.circumference(5)); // 31.4159

//Exercise 4: Interface with Function Types
interface Operation {
  calculate(a: number, b: number): number;
}

class Addition implements Operation {
  calculate(a: number, b: number): number {
    return a + b;
  }
}

class Multiplication implements Operation {
  calculate(a: number, b: number): number {
    return a * b;
  }
}

const add = new Addition();
const multiply = new Multiplication();

console.log(add.calculate(4, 6));      // 10
console.log(multiply.calculate(4, 6)); // 24

//Exercise 5: Extending Interfaces with Optional and Readonly Properties

interface Shape {
  color: string;
  getArea(): number;
}

interface Rectangle extends Shape {
  readonly width: number;
  readonly height: number;
  getPerimeter(): number;
}

class RectangleShape implements Rectangle {
  color: string;
  readonly width: number;
  readonly height: number;

  constructor(color: string, width: number, height: number) {
    this.color = color;
    this.width = width;
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// Demonstration
const rect1 = new RectangleShape("blue", 10, 5);
console.log(`Color: ${rect1.color}`);
console.log(`Area: ${rect1.getArea()}`);           // 50
console.log(`Perimeter: ${rect1.getPerimeter()}`); // 30

// rect1.width = 20;
// Error: Cannot assign to 'width' because it is a read-only property.