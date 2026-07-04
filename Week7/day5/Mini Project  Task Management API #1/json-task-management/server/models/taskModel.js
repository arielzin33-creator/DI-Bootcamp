const fs = require('fs').promises;
const { DATA_PATH } = require('../config/config');

const readTasksFile = async () => {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.writeFile(DATA_PATH, '[]', 'utf8');
            return [];
        }
        throw err;
    }
};

const writeTasksFile = async (tasks) => {
    await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), 'utf8');
};

module.exports = { readTasksFile, writeTasksFile };
