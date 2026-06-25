const express = require('express')
const app = express()
const quizRoutes = require("./routes/quizRoutes");

app.listen(5000, () => {
    console.log('server is listening on port 5000')
})

app.use(express.json());

// Import the router module
const indexRouter = require('./routes/quizRoutes.js');

// Mount the router at a specific path
app.use('/', indexRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Trivia Quiz Game. Start at GET /quiz.");
});