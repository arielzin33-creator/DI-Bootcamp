const fs = require('fs');

fs.copyFileSync('source.txt', 'destination.txt');
console.log('Content copied from source.txt to destination.txt successfully.');