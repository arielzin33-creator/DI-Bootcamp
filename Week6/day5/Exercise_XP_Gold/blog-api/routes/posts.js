const express = require('express');
const router = express.Router();

// In-memory array to store blog posts
let posts = [];
let nextId = 1;

// ---------- Helper: validate post fields ----------
function validatePostBody(body) {
    const { title, content } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return 'A valid, non-empty "title" is required.';
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
        return 'A valid, non-empty "content" is required.';
    }

    return null; // no error
}

// ---------- GET /posts — Retrieve all blog posts ----------
router.get('/', (req, res) => {
    res.status(200).json(posts);
});

// ---------- GET /posts/:id — Retrieve a specific post ----------
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Post id must be a number.' });
    }

    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).json({ error: `Post with id ${id} not found.` });
    }

    res.status(200).json(post);
});

// ---------- POST /posts — Create a new post ----------
router.post('/', (req, res) => {
    const validationError = validatePostBody(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { title, content } = req.body;

    const newPost = {
        id: nextId++,
        title: title.trim(),
        content: content.trim(),
        timestamp: new Date().toISOString()
    };

    posts.push(newPost);

    res.status(201).json(newPost);
});

// ---------- PUT /posts/:id — Update a post ----------
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Post id must be a number.' });
    }

    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).json({ error: `Post with id ${id} not found.` });
    }

    const { title, content } = req.body;

    // Allow partial updates: only validate/update fields that were actually provided
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'Title must be a non-empty string.' });
        }
        post.title = title.trim();
    }

    if (content !== undefined) {
        if (typeof content !== 'string' || content.trim() === '') {
            return res.status(400).json({ error: 'Content must be a non-empty string.' });
        }
        post.content = content.trim();
    }

    if (title === undefined && content === undefined) {
        return res.status(400).json({ error: 'At least one of "title" or "content" must be provided.' });
    }

    post.timestamp = new Date().toISOString(); // update timestamp to reflect the edit

    res.status(200).json(post);
});

// ---------- DELETE /posts/:id — Delete a post ----------
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Post id must be a number.' });
    }

    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
        return res.status(404).json({ error: `Post with id ${id} not found.` });
    }

    const deletedPost = posts.splice(postIndex, 1)[0];

    res.status(200).json({ message: 'Post deleted successfully.', post: deletedPost });
});

module.exports = router;