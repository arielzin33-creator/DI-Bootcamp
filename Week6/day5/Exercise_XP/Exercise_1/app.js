// Exercise 1: Creating a Simple Express.js Application with Routes
const express = require('express')
const app = express()

// Import the router module
const indexRouter = require('./routes/index')

// Mount the router at a specific path
app.use('/', indexRouter)

app.listen(3000, () => {
    console.log('server is listening on port 3000')
})