const express = require('express');
const app = express();
const bookRoutes = require('./server/routes/bookRoutes');
require('dotenv').config();

app.use(express.json());

app.use(bookRoutes);

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
