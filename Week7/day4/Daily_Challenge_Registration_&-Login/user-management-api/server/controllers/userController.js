const express = require('express');
const path = require('path');
const app = express();
const quizRoutes = require('./server/routes/quizRoutes');
require('dotenv').config();

app.use(express.json());

// Serve static frontend assets cleanly
app.use(express.static(path.join(__dirname, 'public')));

// Mount game endpoint controllers
app.use(quizRoutes);

app.use((req, res) => res.status(404).json({ error: 'Endpoint missing' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal System Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Quiz Game running seamlessly on port ${PORT}`));
