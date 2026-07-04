const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/api/books', bookController.getBooks);
router.get('/api/books/:bookId', bookController.getBook);
router.post('/api/books', bookController.addBook);

module.exports = router;
