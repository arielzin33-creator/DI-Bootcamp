//Exercise 6: Object Type Annotations

type person = {
  name3: string; 
  age: number
}

function createPerson (name3: string, age: number): person {
  return {name3, age}
}

const person = createPerson("Alice", 25)
console.log(person)
