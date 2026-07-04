const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(express.json()); // parse incoming JSON request bodies

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

// ---------- Read All Posts ----------
app.get('/api/posts', async(req, res) => {
    try {
        const response = await axios.get(BASE_URL);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        res.status(500).json({ error: 'Failed to fetch posts.' });
    }
});

// ---------- Read Single Post ----------
app.get('/api/posts/:id', async(req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`${BASE_URL}/${id}`);
        res.status(200).json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: `Post with id ${id} not found.` });
        } else {
            console.error('Error fetching post:', error.message);
            res.status(500).json({ error: 'Failed to fetch post.' });
        }
    }
});

// ---------- Create Post ----------
app.post('/api/posts', async(req, res) => {
    const { title, body, userId } = req.body;

    if (!title || !body || !userId) {
        return res.status(400).json({ error: 'title, body, and userId are required.' });
    }

    try {
        const response = await axios.post(BASE_URL, { title, body, userId });
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating post:', error.message);
        res.status(500).json({ error: 'Failed to create post.' });
    }
});

// ---------- Update Post ----------
app.put('/api/posts/:id', async(req, res) => {
    const { id } = req.params;
    const { title, body, userId } = req.body;

    try {
        const response = await axios.put(`${BASE_URL}/${id}`, { id, title, body, userId });
        res.status(200).json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: `Post with id ${id} not found.` });
        } else {
            console.error('Error updating post:', error.message);
            res.status(500).json({ error: 'Failed to update post.' });
        }
    }
});

// ---------- Delete Post ----------
app.delete('/api/posts/:id', async(req, res) => {
    const { id } = req.params;

    try {
        await axios.delete(`${BASE_URL}/${id}`);
        res.status(200).json({ message: `Post with id ${id} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting post:', error.message);
        res.status(500).json({ error: 'Failed to delete post.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});