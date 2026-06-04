// Exercise 3 :Is it a string?
// console.log(isString('hello'));
// true
// console.log(isString([1, 2, 4, 0]));
// false

const isString = (item) => typeof item === 'string';

console.log(isString('hello'))

console.log(isString([1, 2, 4, 0]))