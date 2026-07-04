const postModel = require('../models/postModel');

const getPosts = async (req, res, next) => {
    try {
        const posts = await postModel.getAllPosts();
        res.status(200).json(posts);
    } catch (err) { next(err); }
};

const getPost = async (req, res, next) => {
    try {
        const post = await postModel.getPostById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.status(200).json(post);
    } catch (err) { next(err); }
};

const addPost = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
        const newPost = await postModel.createPost(title, content);
        res.status(201).json(newPost);
    } catch (err) { next(err); }
};

const editPost = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const updatedPost = await postModel.updatePost(req.params.id, title, content);
        if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
        res.status(200).json(updatedPost);
    } catch (err) { next(err); }
};

const removePost = async (req, res, next) => {
    try {
        const deletedPost = await postModel.deletePost(req.params.id);
        if (!deletedPost) return res.status(404).json({ error: 'Post not found' });
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) { next(err); }
};

module.exports = { getPosts, getPost, addPost, editPost, removePost };
