const express = require('express');
const path = require('path');
const app = express();
const userRoutes = require('./server/routes/userRoutes');
require('dotenv').config();

app.use(express.json());

// Serve Static Frontend UI Documents
app.use(express.static(path.join(__dirname, 'public')));

// Fallback matching logic for primary routes to index endpoints easily
app.get('/', (req, res) => {
    res.redirect('/register.html');
});

// Load Identity Control Routers
app.use(userRoutes);

// Route-not-found Interceptor
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint route context missing' });
});

// Central File IO and Core Runtime System Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error File IO Failure' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`JSON flat-file User Identity API operating seamlessly on port ${PORT}`);
});
