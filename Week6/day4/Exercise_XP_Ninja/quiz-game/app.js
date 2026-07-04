const express = require('express');
const path = require('path');
const questions = require('./questions');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Get all questions (WITHOUT correct answers) ----------
app.get('/api/questions', (req, res) => {
    // Strip out correctAnswer before sending to the client
    const questionsForClient = questions.map(({ id, question, options }) => ({
        id,
        question,
        options
    }));

    res.status(200).json(questionsForClient);
});

// ---------- Submit an answer for a specific question ----------
app.post('/api/questions/:id/answer', (req, res) => {
    const questionId = parseInt(req.params.id, 10);
    const { selectedOption } = req.body;

    if (selectedOption === undefined || typeof selectedOption !== 'number') {
        return res.status(400).json({ error: 'selectedOption (a number) is required.' });
    }

    const question = questions.find(q => q.id === questionId);

    if (!question) {
        return res.status(404).json({ error: `Question with id ${questionId} not found.` });
    }

    const isCorrect = selectedOption === question.correctAnswer;

    res.status(200).json({
        isCorrect,
        correctAnswer: question.correctAnswer
    });
});

app.listen(PORT, () => {
    console.log(`Quiz game server running on http://localhost:${PORT}`);
});