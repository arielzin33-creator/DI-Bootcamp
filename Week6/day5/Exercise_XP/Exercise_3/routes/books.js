// routes/books.js
const express = require('express');
const router = express.Router();

// Sample in-memory database for storing books
const books = [
    { id: 1, title: "Pride and Prejudice", author: "Jane Austen", year: 1813 },
    { id: 2, title: "Moby-Dick", author: "Herman Melville", year: 1851 },
    { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald ", year: 1925 },
    { id: 4, title: "The Lord of the Rings", author: "J.R.R. Tolkien", year: 1954 },
];

// Get all books
router.get('/', (req, res) => {
    res.json(books)
})

// Add a new book
router.post("/", (req, res) => {
    const newBook = {
        id: books.length + 1,
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
    };
    books.push(newBook);
    res.status(201).json(newBook);
});
// Update a book by ID
router.put("/:bookID", (req, res) => {
    const id = Number(req.params.bookID);
    const index = books.findIndex((book) => book.id === id);
    if (index === -1) {
        return res.status(404).send("Book not found");
    }
    const updatedBook = {
        id: id,
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
    };
    books[index] = updatedBook;
    res.status(200).json("book updated");
});

// Delete a book by ID
router.delete("/:bookID", (req, res) => {
    const id = Number(req.params.bookID);
    const index = books.findIndex((book) => book.id === id);
    if (index === -1) {
        return res.status(404).send("Book not found");
    }
    books.splice(index, 1);
    res.status(200).json("book deleted");
});

module.exports = router;