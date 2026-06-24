//Exercise 1: Building a RESTful API

const express = require('express');
const app = express();


app.use(express.json()); // parse json body content


// start server
app.listen(5000, () => {
    console.log(`server is listening on port ${5000}`);
});

// data (array of EV models)
let EV_Models = [
    { id: 1, title: 'Mg Cyberster', content: 'EV retro roadster' },
    { id: 2, title: 'Denza Z spyder', content: 'EV powerful roadster' },
    { id: 3, title: 'Polestar 6', content: 'EV futuristic roadster' },
    { id: 4, title: 'RBW Roadster', content: 'EV Classic roadster' },
];


// POST /EV_Models - return all blog posts
app.post("/api/EV_Models", (req, res) => {
    const EV_Models = {
        id: EV_Models.length + 1,
        title: req.body.title,
        content: req.body.content,
    };
    EV_Models.push(newEV_Models);
    res.status(201).json(newEV_Models);
});

// GET /api/EV_Models - return all EV models
app.get('/api/EV_Models', (req, res) => {
    res.json(EV_Models);
});

// GET /api/EV_Models/:id - return a model by ID
app.get('/api/EV_Models/:id', (req, res) => {
    const id = Number(req.params.id);
    const car = EV_Models.find((p) => p.id === id);
    if (!car) return res.status(404).send('car post not found');
    res.json(car);
});

// PUT /api/EV_Models/:id - update a model
app.put('/api/EV_Models/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = EV_Models.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).send('EV_Model not found');
    const updated = {
        id: EV_Models[idx].id,
        title: req.body.title,
        content: req.body.content,
    };
    EV_Models[idx] = updated;
    res.status(200).json(updated);
});

// DELETE /api/EV_Models/:id - remove a model
app.delete('/api/EV_Models/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = EV_Models.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).send('EV_Model not found');
    products.splice(idx, 1);
    res.status(200).json({ message: 'Product deleted' });
});

// Handle requests to undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Generic error handler for unexpected server errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});