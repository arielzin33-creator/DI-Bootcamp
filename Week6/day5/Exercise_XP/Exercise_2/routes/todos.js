const express = require('express')
const router = express.Router()

// Sample in-memory database for storing to-do items
const todos = [
    { id: 1, task: "Buy groceries", completed: false },
    { id: 2, task: "Walk the dog", completed: true },
    { id: 3, task: "Finish project report", completed: false },
    { id: 4, task: "Schedule dentist appointment", completed: false },
    { id: 5, task: "Read a book chapter", completed: true },
    { id: 6, task: "Pay electricity bill", completed: false },
    { id: 7, task: "Prepare presentation slides", completed: false },
    { id: 8, task: "Call the bank", completed: true },
];

// Get all to-do items
router.get('/todos', (req, res) => {
    res.json(todos)
})

// Add a new to-do item
router.post("/todos", (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        task: req.body.task,
        completed: false,
    };
    todos.push(newTodo);
    res.json(newTodo);
});

// Update a to-do item by ID
router.put("/todos/:id", (req, res) => {
    const todo = todos.find((t) => t.id === parseInt(req.params.id));
    if (!todo) {
        return res.status(404).json({ message: "To-do not found" });
    }
    todo.task = req.body.task;
    todo.completed = req.body.completed;
    res.json(todo);
});

// Delete a to-do item by ID
router.delete("/todos/:id", (req, res) => {
    const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ message: "To-do not found" });
    }
    todos.splice(index, 1);
    res.json({ message: "To-do deleted" });
});

module.exports = router