const lodash1 = require('lodash');
const { add, multiply } = require('./math');

const numbers = [1, 2, 3, 4, 5];

const sum = lodash1.reduce(numbers, add, 0);
const product = lodash1.reduce(numbers, multiply, 1);

console.log(`Sum of numbers: ${sum}`);
console.log(`Average using lodash: ${lodash1.mean(numbers)}`);
console.log(`Product of numbers: ${product}`);