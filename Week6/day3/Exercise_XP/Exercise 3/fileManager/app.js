const { readFile, writeFile } = require('./fileManager');

const helloContent = readFile('Hello World.txt');
console.log(helloContent);

writeFile('Bye World.txt', 'Writing to the file');
console.log('Bye World.txt updated successfully.');