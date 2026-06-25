//Exercise 2: Simple to-do list exercise using Express.js and express.Router

const express = require('express')
const app = express()

// Import the router module
const todosRouter = require('./routes/todos')

// Mount the router at a specific path
app.use('/', todosRouter)
app.use(express.json());

app.listen(3000, () => {
    console.log('server is listening on port 3000')
})