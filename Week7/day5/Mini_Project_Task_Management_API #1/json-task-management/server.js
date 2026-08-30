const express = require('express');
const app = express();
const taskRoutes = require('./server/routes/taskRoutes');
require('dotenv').config();

app.use(express.json());

// Mount the modular routes
app.use(taskRoutes);

// Fallback matching logic for route-not-found interception
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint route context missing' });
});

// Centralized File System IO and Server Application Error Hub
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error File IO Failure' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`JSON flat-file Task Management API operating seamlessly on port ${PORT}`);
});
