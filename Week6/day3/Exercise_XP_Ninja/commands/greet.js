const chalk = require('chalk');

function greet(name) {
    const displayName = name || 'Ninja';

    console.log(chalk.bold.green(`⚔️  Welcome, ${displayName}! ⚔️`));
    console.log(chalk.yellow('May your code be swift and your bugs be few.'));
}

module.exports = greet;