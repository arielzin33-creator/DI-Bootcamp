//Exercise 1: Advanced Access Modifiers and Inheritance

class Employee {
  public name: string;
  private age: number;
  protected salary: number;

  constructor(name: string, age: number, salary: number) {
    this.name = name;
    this.age = age;
    this.salary = salary;
  }

  // Protected: accessible within Employee and any subclass, but not from outside
  protected calculateBonus(): number {
    return this.salary * 0.1; // 10% bonus, as a base rule
  }

  public getSalaryDetails(): string {
    return `Name: ${this.name}, Salary: $${this.salary}`;
  }
}

class Manager extends Employee {
  // Override getSalaryDetails to include a bonus calculation
  public getSalaryDetails(): string {
    const bonus = this.calculateBonus(); // accessible: protected method, same inheritance chain
    return `${super.getSalaryDetails()}, Bonus: $${bonus}`;
  }
}

class ExecutiveManager extends Manager {
  public approveBudget(amount: number): string {
    return `Executive ${this.name} approved a budget of $${amount}.`;
  }

  // Executives get a bigger bonus -> override the protected method itself
  protected calculateBonus(): number {
    return this.salary * 0.2; // 20% bonus for executives
  }
}

// Demonstration
const exec1 = new ExecutiveManager("Nadia Petrov", 45, 120000);

console.log(exec1.getSalaryDetails());
// Name: Nadia Petrov, Salary: $120000, Bonus: $24000  (uses the overridden calculateBonus)

console.log(exec1.approveBudget(50000));
// Executive Nadia Petrov approved a budget of $50000.

console.log(exec1.name); // "Nadia Petrov" -> OK, public

// exec1.age;             // Error: 'age' is private and only accessible within class 'Employee'.
// exec1.salary;          // Error: 'salary' is protected and only accessible within Employee and its subclasses.
// exec1.calculateBonus(); // Error: 'calculateBonus' is protected and only accessible within the class hierarchy.

//Exercise 2: Advanced Static Methods and Properties

class Shape {
  static totalShapes: number = 0;

  constructor() {
    Shape.totalShapes += 1; // increment the shared counter on every instantiation, including subclasses
  }

  static getType(): string {
    return "Generic Shape";
  }
}

class Circle extends Shape {
  radius: number;

  constructor(radius: number) {
    super(); // ensures Shape.totalShapes still increments for Circle instances
    this.radius = radius;
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  static getType(): string {
    return "Circle";
  }
}

class Square extends Shape {
  side: number;

  constructor(side: number) {
    super();
    this.side = side;
  }

  area(): number {
    return this.side ** 2;
  }

  static getType(): string {
    return "Square";
  }
}

// Demonstration
const circle1 = new Circle(4);
const square1 = new Square(5);
const circle2 = new Circle(2);

console.log(Circle.getType());  // "Circle"
console.log(Square.getType());  // "Square"
console.log(Shape.getType());   // "Generic Shape"

console.log(circle1.area().toFixed(2)); // "50.27"
console.log(square1.area());            // 25

console.log(`Total shapes created: ${Shape.totalShapes}`); // Total shapes created: 3

//Exercise 3: Complex Interfaces with Function Types

interface Calculator {
  a: number;
  b: number;
  operate(operation: (x: number, y: number) => number): number;
}

class AdvancedCalculator implements Calculator {
  a: number;
  b: number;

  constructor(a: number, b: number) {
    this.a = a;
    this.b = b;
  }

  operate(operation: (x: number, y: number) => number): number {
    return operation(this.a, this.b);
  }
}

// Standalone operation functions, matching the (x: number, y: number) => number signature
const add = (x: number, y: number): number => x + y;
const subtract = (x: number, y: number): number => x - y;
const multiply = (x: number, y: number): number => x * y;

// Demonstration
const calc = new AdvancedCalculator(10, 4);

console.log(calc.operate(add));      // 14
console.log(calc.operate(subtract)); // 6
console.log(calc.operate(multiply)); // 40

// Also works fine with an inline arrow function:
console.log(calc.operate((x, y) => x / y)); // 2.5

//Exercise 4: Readonly Properties in Complex Inheritance

class Device {
  readonly serialNumber: string;

  constructor(serialNumber: string) {
    this.serialNumber = serialNumber;
  }

  public getDeviceInfo(): string {
    return `Serial Number: ${this.serialNumber}`;
  }
}

class Laptop extends Device {
  model: string;
  price: number;

  constructor(serialNumber: string, model: string, price: number) {
    super(serialNumber); // readonly serialNumber is set once, here, via the base constructor
    this.model = model;
    this.price = price;
  }

  // Override to include model and price alongside the inherited serialNumber
  public getDeviceInfo(): string {
    return `${super.getDeviceInfo()}, Model: ${this.model}, Price: $${this.price}`;
  }
}

// Demonstration
const laptop1 = new Laptop("SN-9821X", "UltraBook Pro 14", 1299);

console.log(laptop1.getDeviceInfo());
// Serial Number: SN-9821X, Model: UltraBook Pro 14, Price: $1299

// Updating mutable properties is fine:
laptop1.price = 1099; // OK -> price is not readonly
laptop1.model = "UltraBook Pro 14 (2024)"; // OK -> model is not readonly

console.log(laptop1.getDeviceInfo());
// Serial Number: SN-9821X, Model: UltraBook Pro 14 (2024), Price: $1099

// laptop1.serialNumber = "SN-0000X";
// Error: Cannot assign to 'serialNumber' because it is a read-only property.

//Exercise 5: Extending Multiple Interfaces with Optional and Readonly Properties

interface Product {
  readonly name: string;
  price: number;
  discount?: number; // optional
}

interface Electronics extends Product {
  warrantyPeriod: string; // e.g. "2 years"
}

class Smartphone implements Electronics {
  readonly name: string;
  price: number;
  discount?: number;
  warrantyPeriod: string;

  constructor(name: string, price: number, warrantyPeriod: string, discount?: number) {
    this.name = name;
    this.price = price;
    this.warrantyPeriod = warrantyPeriod;
    this.discount = discount; // may remain undefined if not provided
  }

  // Calculates the final price after applying the discount, if any
  getFinalPrice(): number {
    if (this.discount === undefined) {
      return this.price;
    }
    return this.price - this.price * (this.discount / 100);
  }

  getInfo(): string {
    const discountText = this.discount !== undefined ? `${this.discount}%` : "None";
    return `${this.name} - $${this.price} (Discount: ${discountText}, Warranty: ${this.warrantyPeriod}) -> Final Price: $${this.getFinalPrice().toFixed(2)}`;
  }
}

// Demonstration
const phone1 = new Smartphone("Pixel 9", 899, "2 years", 15);
const phone2 = new Smartphone("Pixel 9a", 599, "1 year"); // no discount provided

console.log(phone1.getInfo());
// Pixel 9 - $899 (Discount: 15%, Warranty: 2 years) -> Final Price: $764.15

console.log(phone2.getInfo());
// Pixel 9a - $599 (Discount: None, Warranty: 1 year) -> Final Price: $599.00

// phone1.name = "Pixel 10";
// Error: Cannot assign to 'name' because it is a read-only property.