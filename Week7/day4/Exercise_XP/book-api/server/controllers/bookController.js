const bookModel = require('../models/bookModel');

const getBooks = async (req, res, next) => {
    try {
        const books = await bookModel.getAllBooks();
        res.status(200).json(books);
    } catch (err) { next(err); }
};

const getBook = async (req, res, next) => {
    try {
        const bookId = req.params.bookId;
        const book = await bookModel.getBookById(bookId);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.status(200).json(book);
    } catch (err) { next(err); }
};

const addBook = async (req, res, next) => {
    try {
        const { title, author, publishedYear } = req.body;
        if (!title || !author || !publishedYear) {
            return res.status(400).json({ error: 'Title, author, and publishedYear are required' });
        }
        const newBook = await bookModel.createBook(title, author, publishedYear);
        res.status(201).json(newBook);
    } catch (err) { next(err); }
};

module.exports = { getBooks, getBook, addBook };
