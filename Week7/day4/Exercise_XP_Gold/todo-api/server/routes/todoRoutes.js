const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

router.get('/api/todos', todoController.getTodos);
router.get('/api/todos/:id', todoController.getTodo);
router.post('/api/todos', todoController.addTodo);
router.put('/api/todos/:id', todoController.editTodo);
router.delete('/api/todos/:id', todoController.removeTodo);

module.exports = router;
