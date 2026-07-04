//Exercise 2: Advanced Module Usage using ES6 module syntax

import { properties } from './data.js';

function calculateAverageAge(persons) {
    const total = persons.reduce((sum, person) => sum + person.age, 0);
    return total / persons.length;
}

const averageAge = calculateAverageAge(properties);
console.log(`Average age: ${averageAge}`);