const express = require('express');
const { randomUUID } = require('crypto');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(__dirname));

// Array of emoji objects: character + correct name
const emojiList = [
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🐶', name: 'Dog' },
    { emoji: '🚀', name: 'Rocket' },
    { emoji: '🎸', name: 'Guitar' },
    { emoji: '🌵', name: 'Cactus' },
    { emoji: '🦄', name: 'Unicorn' },
    { emoji: '⛄', name: 'Snowman' },
    { emoji: '🍩', name: 'Donut' },
    { emoji: '🐝', name: 'Bee' },
    { emoji: '🎃', name: 'Pumpkin' }
];

// Active puzzles awaiting an answer: puzzleId -> correct name
const activePuzzles = new Map();

// Cumulative score per player: playerName -> score
const playerScores = new Map();

// Fisher-Yates shuffle, used both for picking distractors and randomizing option order
function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function buildPuzzle() {
    const correct = emojiList[Math.floor(Math.random() * emojiList.length)];

    // Pick 3 random distractors that aren't the correct answer
    const distractorPool = emojiList.filter(item => item.name !== correct.name);
    const distractors = shuffle(distractorPool).slice(0, 3);

    // Combine correct + distractors, then shuffle so the right answer isn't always first
    const options = shuffle([correct, ...distractors]).map(item => item.name);

    const puzzleId = randomUUID();
    activePuzzles.set(puzzleId, correct.name);

    return { puzzleId, emoji: correct.emoji, options };
}

// GET / - serves the front end
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /api/emoji - generates and returns a new puzzle
app.get('/api/emoji', (req, res) => {
    res.json(buildPuzzle());
});

// POST /api/guess - checks a submitted guess and updates the player's score
app.post('/api/guess', (req, res) => {
    const { playerName, puzzleId, guess } = req.body;

    if (!playerName || !puzzleId || !guess) {
        return res.status(400).json({ message: 'playerName, puzzleId and guess are required' });
    }

    const correctName = activePuzzles.get(puzzleId);
    if (!correctName) {
        return res.status(404).json({ message: 'Puzzle not found or already answered' });
    }

    activePuzzles.delete(puzzleId); // each puzzle can only be answered once

    const isCorrect = guess === correctName;
    const currentScore = playerScores.get(playerName) || 0;
    const newScore = isCorrect ? currentScore + 1 : currentScore;
    playerScores.set(playerName, newScore);

    res.json({ correct: isCorrect, correctAnswer: correctName, score: newScore });
});

// GET /api/leaderboard - returns the top 10 scores, highest first
app.get('/api/leaderboard', (req, res) => {
    const leaderboard = Array.from(playerScores.entries())
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    res.json(leaderboard);
});

app.listen(PORT, () => {
    console.log(`Emoji guessing game server running on port ${PORT}`);
});