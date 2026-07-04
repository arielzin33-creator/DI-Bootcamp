const fs = require('fs').promises;
const { DATA_PATH } = require('../config/config');

const readUsersFile = async () => {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist yet, return empty array
        if (err.code === 'ENOENT') {
            await fs.writeFile(DATA_PATH, '[]', 'utf8');
            return [];
        }
        throw err;
    }
};

const writeUsersFile = async (users) => {
    await fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2), 'utf8');
};

module.exports = { readUsersFile, writeUsersFile };
