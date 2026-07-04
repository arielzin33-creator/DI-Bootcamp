const { Command } = require('commander');
const greet = require('./commands/greet');
const fetchData = require('./commands/fetch');
const readFile = require('./commands/read');

const program = new Command();

program
    .name('ninja-utility')
    .description('A CLI utility with greet, fetch, and read commands')
    .version('1.0.0');

program
    .command('greet')
    .description('Display a colorful greeting message')
    .argument('[name]', 'name to greet')
    .action((name) => {
        greet(name);
    });

program
    .command('fetch')
    .description('Fetch data from a public API and display it')
    .action(() => {
        fetchData();
    });

program
    .command('read')
    .description('Read and display the content of a file')
    .argument('<filePath>', 'path to the file to read')
    .action((filePath) => {
        readFile(filePath);
    });

program.parse(process.argv);