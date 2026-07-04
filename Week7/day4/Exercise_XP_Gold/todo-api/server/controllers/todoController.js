const todoModel = require('../models/todoModel');

const getTodos = async (req, res, next) => {
    try {
        const todos = await todoModel.getAllTodos();
        res.status(200).json(todos);
    } catch (err) { next(err); }
};

const getPost = async (req, res, next) => { // maps to GET /api/todos/:id
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

        const todo = await todoModel.getTodoById(id);
        if (!todo) return res.status(404).json({ error: 'Todo task not found' });
        
        res.status(200).json(todo);
    } catch (err) { next(err); }
};

const addTodo = async (req, res, next) => {
    try {
        const { title } = req.body;
        if (!title || title.trim() === "") {
            return res.status(400).json({ error: 'The task title is required' });
        }
        
        const newTodo = await todoModel.createTodo(title.trim());
        res.status(201).json(newTodo);
    } catch (err) { next(err); }
};

const editTodo = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

        const { title, completed } = req.body;
        if (!title || title.trim() === "" || typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'Title and completed status (boolean) are required' });
        }

        const updatedTodo = await todoModel.updateTodo(id, title.trim(), completed);
        if (!updatedTodo) return res.status(404).json({ error: 'Todo task not found' });

        res.status(200).json(updatedTodo);
    } catch (err) { next(err); }
};

const removeTodo = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

        const deletedTodo = await todoModel.deleteTodo(id);
        if (!deletedTodo) return res.status(404).json({ error: 'Todo task not found' });

        res.status(200).json({ message: 'Todo task deleted successfully' });
    } catch (err) { next(err); }
};

module.exports = { getTodos, getTodo: getPost, addTodo, editTodo, removeTodo };
