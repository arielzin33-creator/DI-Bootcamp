const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPost);
router.post('/posts', postController.addPost);
router.put('/posts/:id', postController.editPost);
router.delete('/posts/:id', postController.removePost);

module.exports = router;
