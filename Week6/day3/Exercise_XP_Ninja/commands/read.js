const fs = require('fs');
const path = require('path');

function readFile(filePath) {
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
        console.error(`File not found: ${resolvedPath}`);
        return;
    }

    try {
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        console.log(`Contents of ${resolvedPath}:\n`);
        console.log(content);
    } catch (error) {
        console.error('Error reading file:', error.message);
    }
}

module.exports = readFile;