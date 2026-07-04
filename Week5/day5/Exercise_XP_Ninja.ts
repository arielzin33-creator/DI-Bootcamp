//Exercise 1: TypeScript Generics and Intersection Types

class Container<T extends object> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  remove(predicate: (item: T) => boolean): void {
    this.items = this.items.filter(item => !predicate(item));
  }

  list(): T[] {
    return [...this.items]; // return a copy to preserve encapsulation
  }
}

// Intersection types combined with the generic Container
type Identifiable = { id: number };
type Named = { name: string };

type NamedEntity = Identifiable & Named;

// Demonstration
const container = new Container<NamedEntity>();

container.add({ id: 1, name: "Widget A" });
container.add({ id: 2, name: "Widget B" });
container.add({ id: 3, name: "Widget C" });

console.log(container.list());
// [ { id: 1, name: 'Widget A' }, { id: 2, name: 'Widget B' }, { id: 3, name: 'Widget C' } ]

container.remove(item => item.id === 2);

console.log(container.list());
// [ { id: 1, name: 'Widget A' }, { id: 3, name: 'Widget C' } ]

// Demonstration with a different intersection type
type Priced = { price: number };
type PricedProduct = NamedEntity & Priced;

const productContainer = new Container<PricedProduct>();
productContainer.add({ id: 101, name: "Laptop", price: 999.99 });
productContainer.add({ id: 102, name: "Mouse", price: 29.99 });

console.log(productContainer.list());
// [ { id: 101, name: 'Laptop', price: 999.99 }, { id: 102, name: 'Mouse', price: 29.99 } ]

//Exercise 2: Generic Interfaces and Type Casting

interface Response<T> {
  status: number;
  data: T;
  message?: string;
}

function parseResponse<T>(rawResponse: unknown): Response<T> {
  // Type casting (technically a type assertion) to treat the raw response
  // as a properly-shaped Response<T>
  const parsed = rawResponse as Response<T>;
  return parsed;
}

// Demonstration
interface UserData {
  id: number;
  username: string;
}

const rawApiResponse: unknown = {
  status: 200,
  data: { id: 1, username: "elena_rossi" },
  message: "Success"
};

const userResponse = parseResponse<UserData>(rawApiResponse);

console.log(userResponse.status);         // 200
console.log(userResponse.data.username);  // elena_rossi
console.log(userResponse.message);        // Success

// Demonstration with an array of data
interface Product {
  id: number;
  name: string;
  price: number;
}

const rawProductsResponse: unknown = {
  status: 200,
  data: [
    { id: 1, name: "Keyboard", price: 49.99 },
    { id: 2, name: "Monitor", price: 199.99 }
  ]
};

const productsResponse = parseResponse<Product[]>(rawProductsResponse);
console.log(productsResponse.data[0].name); // Keyboard

//Exercise 3: Generic Classes and Type Assertions

class Repository<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getById(predicate: (item: T) => boolean): T {
    const found = this.items.find(predicate);

    // Type assertion: we assert the result is definitely a T,
    // even though .find() can technically return T | undefined
    return found as T;
  }

  getByIdSafe(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  list(): T[] {
    return [...this.items];
  }
}

// Demonstration
interface Customer {
  id: number;
  name: string;
  email: string;
}

const customerRepo = new Repository<Customer>();

customerRepo.add({ id: 1, name: "Marco Bianchi", email: "marco.bianchi@example.com" });
customerRepo.add({ id: 2, name: "Aisha Khan", email: "aisha.khan@example.com" });

console.log(customerRepo.list());
// [ { id: 1, name: 'Marco Bianchi', ... }, { id: 2, name: 'Aisha Khan', ... } ]

const foundCustomer = customerRepo.getById(c => c.id === 2);
console.log(foundCustomer.name); // Aisha Khan -> works because we asserted the type as T

const notFound = customerRepo.getById(c => c.id === 999);
console.log(notFound); // undefined at runtime, but TypeScript "thinks" it's a Customer!