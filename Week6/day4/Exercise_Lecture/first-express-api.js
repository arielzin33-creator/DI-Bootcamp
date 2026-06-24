const express = require('express')
const app = express()

app.listen(3000, () => {
    console.log('server is listening on port 3000')
})

app.get('/api/greetings', (req, res) => {
    res.json({ message: 'Hello! Welcome to your first Express API.' });
});