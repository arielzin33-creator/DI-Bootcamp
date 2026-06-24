//Exercise 2: Building a Basic CRUD API with Express.js

const express = require('express');
const app = express();

//id, title, author, and publishedYear.
const books = [
    { id: 1, title: 'Matrix', author: 'unknown', publishedYear: 1999 },
    { id: 2, title: 'Hamlet', author: 'Shakespeer', publishedYear: 1562 },
    { id: 3, title: 'Enders Game', author: 'someone', publishedYear: 1986 },
    { id: 4, title: 'Cain and Able', author: 'Jeffrey Archer', publishedYear: 1965 },

];

app.listen(5000, () => {
    console.log("server is listening on port 5000");
});

// Middleware to parse JSON request bodies (needed for POST /api/books)
app.use(express.json());

// "Read all" route - GET /api/books
app.get('/api/books', (req, res) => {
    res.json(books);
});

// "Read" route - GET /api/books/:bookId
app.get('/api/books/:bookId', (req, res) => {
    const bookId = parseInt(req.params.bookId);
    const book = books.find(b => b.id === bookId);

    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

// "Create" route - POST /api/books
app.post('/api/books', (req, res) => {
    const { title, author, publishedYear } = req.body;

    const newBook = {
        id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
        title,
        author,
        publishedYear
    };

    books.push(newBook);
    res.status(201).json(newBook);
});