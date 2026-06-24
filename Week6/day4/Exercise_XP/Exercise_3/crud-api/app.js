//Exercise 3: Building a Basic CRUD API with Express and Axios using a Data Module

const express = require('express');
const app = express();
const { fetchPosts } = require('./data/dataService');

app.listen(5000, () => {
    console.log("server is listening on port 5000");
});

// GET /api/posts - retrieves posts via the data module and returns them
app.get('/api/posts', async(req, res) => {
    try {
        const posts = await fetchPosts();
        console.log('Data successfully retrieved and sent as response.');
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        res.status(500).json({ message: 'Failed to retrieve posts' });
    }
});