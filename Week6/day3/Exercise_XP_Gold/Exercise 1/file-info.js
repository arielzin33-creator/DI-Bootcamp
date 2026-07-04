const path = require('path');
const fs = require('fs');

function getFileInfo() {
    // Build a cross-platform-safe path to the file inside the data directory
    const filePath = path.join(__dirname, 'data', 'example.txt');

    const exists = fs.existsSync(filePath);

    if (!exists) {
        console.log(`File does not exist at path: ${filePath}`);
        return;
    }

    const stats = fs.statSync(filePath);

    console.log(`File exists: ${exists}`);
    console.log(`File size: ${stats.size} bytes`);
    console.log(`Creation time: ${stats.birthtime}`);
}

module.exports = getFileInfo;