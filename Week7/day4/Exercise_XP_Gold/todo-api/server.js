const express = require('express');
const app = express();
const todoRoutes = require('./server/routes/todoRoutes');
require('dotenv').config();

app.use(express.json());

app.use(todoRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'API Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Todo List API is running and listening on port ${PORT}`);
});
