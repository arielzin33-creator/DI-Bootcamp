const fs = require('fs');

const fetchNotes = () => {
    try {
        const notesString = fs.readFileSync('notes-data.json', 'utf8');
        return JSON.parse(notesString);
    } catch (e) {
        return [];
    }
};

const saveNotes = (notes) => {
    fs.writeFileSync('notes-data.json', JSON.stringify(notes, null, 2));
};

const addNote = (title, body) => {
    const notes = fetchNotes();
    const duplicateNote = notes.find((note) => note.title.toLowerCase() === title.toLowerCase());

    if (!duplicateNote) {
        const note = { title, body };
        notes.push(note);
        saveNotes(notes);
        return note;
    } else {
        return null;
    }
};

const getAll = () => {
    return fetchNotes();
};

const getNote = (title) => {
    const notes = fetchNotes();
    return notes.find((note) => note.title.toLowerCase() === title.toLowerCase());
};

const removeNote = (title) => {
    const notes = fetchNotes();
    const filteredNotes = notes.filter((note) => note.title.toLowerCase() !== title.toLowerCase());
    saveNotes(filteredNotes);

    return notes.length !== filteredNotes.length;
};

const logNote = (note) => {
    console.log('--');
    console.log(`Title: ${note.title}`);
    console.log(`Body: ${note.body}`);
};

module.exports = {
    addNote,
    getAll,
    getNote,
    removeNote,
    logNote
};
