const express = require('express');
const app = express();
const postRoutes = require('./server/routes/postRoutes');
require('dotenv').config();

app.use(express.json());

app.use(postRoutes);

app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Blog API running on port ${PORT}`));
