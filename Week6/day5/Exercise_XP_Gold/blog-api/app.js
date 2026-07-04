const express = require('express');
const postsRouter = require('./routes/posts');

const app = express();
const PORT = 5000;

app.use(express.json());

// Mount the posts router under the /posts path
app.use('/posts', postsRouter);

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
    console.log(`Blog API running on http://localhost:${PORT}`);
});