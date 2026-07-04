const minutesLived = require('./date');

// Hardcoded birthdate, as instructed by the exercise
const myBirthdate = '1995-06-15';

const minutes = minutesLived(myBirthdate);

console.log(`You have lived approximately ${minutes.toLocaleString()} minutes.`);