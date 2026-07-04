import chalk from 'chalk';

export function displayColorfulMessage() {
    console.log(chalk.blue.bold('Hello from Node.js!'));
    console.log(chalk.green('This is a colorful message using the chalk package.'));
    console.log(chalk.yellow.italic('Chalk makes terminal output vibrant and easy to read.'));
    console.log(chalk.red.underline('Node.js + NPM = Powerful!'));
}
