const taskModel = require('../models/taskModel');

const getTasks = async (req, res, next) => {
    try {
        const tasks = await taskModel.readTasksFile();
        res.status(200).json(tasks);
    } catch (err) { next(err); }
};

const getTaskById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

        const tasks = await taskModel.readTasksFile();
        const task = tasks.find(t => t.id === id);

        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json(task);
    } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Task title is required' });
        }

        const tasks = await taskModel.readTasksFile();
        
        const newTask = {
            id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
            title: title.trim(),
            description: description ? description.trim() : '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        await taskModel.writeTasksFile(tasks);

        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

        const { title, description, completed } = req.body;
        const tasks = await taskModel.readTasksFile();
        const index = tasks.findIndex(t => t.id === id);

        if (index === -1) return res.status(404).json({ error: 'Task not found' });

        // Update with input validation overrides if parameters exist
        if (title !== undefined) {
            if (title.trim() === '') return res.status(400).json({ error: 'Title cannot be empty string' });
            tasks[index].title = title.trim();
        }
        if (description !== undefined) {
            tasks[index].description = description.trim();
        }
        if (completed !== undefined) {
            if (typeof completed !== 'boolean') return res.status(400).json({ error: 'Completed parameter must be a boolean status type' });
            tasks[index].completed = completed;
        }

        await taskModel.writeTasksFile(tasks);
        res.status(200).json({ message: 'Task updated successfully', task: tasks[index] });
    } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

        const tasks = await taskModel.readTasksFile();
        const index = tasks.findIndex(t => t.id === id);

        if (index === -1) return res.status(404).json({ error: 'Task not found' });

        const deletedTask = tasks.splice(index, 1)[0];
        await taskModel.writeTasksFile(tasks);

        res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
    } catch (err) { next(err); }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
