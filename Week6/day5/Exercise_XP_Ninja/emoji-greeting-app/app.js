const express = require('express');
const path = require('path');
const greetRouter = require('./routes/greet');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed to parse form submissions
app.use(express.static(path.join(__dirname, 'public')));

// Mount the router at the root path
app.use('/', greetRouter);

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).send('<h1>404 - Page Not Found</h1><a href="/">Go home</a>');
});

app.listen(PORT, () => {
    console.log(`Emoji Greeting App running on http://localhost:${PORT}`);
});