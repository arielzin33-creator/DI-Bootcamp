const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(express.json());

// In-memory array to store todo objects
let todos = [];

// ---------- Create a new todo ----------
app.post('/api/todos', (req, res) => {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'A valid "title" is required.' });
    }

    const newTodo = {
        id: uuidv4(),
        title: title.trim(),
        completed: false
    };

    todos.push(newTodo);

    res.status(201).json(newTodo);
});

// ---------- Get all todos ----------
app.get('/api/todos', (req, res) => {
    res.status(200).json(todos);
});

// ---------- Get a specific todo ----------
app.get('/api/todos/:id', (req, res) => {
    const { id } = req.params;

    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({ error: `Todo with id ${id} not found.` });
    }

    res.status(200).json(todo);
});

// ---------- Update a todo ----------
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;

    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({ error: `Todo with id ${id} not found.` });
    }

    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'Title must be a non-empty string.' });
        }
        todo.title = title.trim();
    }

    if (completed !== undefined) {
        if (typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'Completed must be a boolean.' });
        }
        todo.completed = completed;
    }

    res.status(200).json(todo);
});

// ---------- Delete a todo ----------
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;

    const todoIndex = todos.findIndex(t => t.id === id);

    if (todoIndex === -1) {
        return res.status(404).json({ error: `Todo with id ${id} not found.` });
    }

    const deletedTodo = todos.splice(todoIndex, 1)[0];

    res.status(200).json({ message: 'Todo deleted successfully.', todo: deletedTodo });
});

app.listen(PORT, () => {
    console.log(`Todo List API running on http://localhost:${PORT}`);
});