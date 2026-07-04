const fs = require('fs');

const files = fs.readdirSync(__dirname);

console.log('Files in directory:');
files.forEach((file) => console.log(file));