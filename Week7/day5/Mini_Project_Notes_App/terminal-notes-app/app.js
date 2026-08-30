const yargs = require('yargs');
const _ = require('lodash');
const notes = require('./notes.js');

const titleOptions = {
    describe: 'Title of note',
    demandOption: true,
    type: 'string'
};

const bodyOptions = {
    describe: 'Body of note',
    demandOption: true,
    type: 'string'
};

const argv = yargs
    .command('add', 'Add a new note', {
        title: titleOptions,
        body: bodyOptions
    })
    .command('list', 'List all notes')
    .command('read', 'Read a note', {
        title: titleOptions
    })
    .command('remove', 'Remove a note', {
        title: titleOptions
    })
    .help()
    .argv;

// Using lodash to capture the primary text command parameter safely
const command = _.first(argv._);

if (command === 'add') {
    const note = notes.addNote(argv.title, argv.body);
    if (note) {
        console.log('Note created successfully!');
        notes.logNote(note);
    } else {
        console.log('Note already exists');
    }
} else if (command === 'list') {
    const allNotes = notes.getAll();
    console.log(`Printing ${allNotes.length} note(s).`);
    allNotes.forEach((note) => notes.logNote(note));
} else if (command === 'read') {
    const note = notes.getNote(argv.title);
    if (note) {
        console.log('Note found:');
        notes.logNote(note);
    } else {
        console.log('Note not found');
    }
} else if (command === 'remove') {
    const noteRemoved = notes.removeNote(argv.title);
    const message = noteRemoved ? 'Note was removed successfully!' : 'Note not found';
    console.log(message);
} else {
    console.log('command not recognized');
}
