//Exercise 3: Basic API for managing a list of books using Express.js and express.Router

const express = require('express')
const app = express()

// Middleware to parse JSON
app.use(express.json());

// Import the router module
const booksRouter = require('./routes/books.js')

// Mount the router at a specific path
app.use('/books', booksRouter)

app.listen(3000, () => {
    console.log('server is listening on port 3000')
})