let currentPuzzleId = null;
let score = 0;

const emojiDisplay = document.getElementById('emojiDisplay');
const optionsContainer = document.getElementById('optionsContainer');
const guessForm = document.getElementById('guessForm');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const playerNameInput = document.getElementById('playerName');
const leaderboardList = document.getElementById('leaderboard');

// Fetches a new puzzle and renders the emoji + multiple-choice options
async function loadNewPuzzle() {
    feedback.textContent = '';
    const response = await fetch('/api/emoji');
    const puzzle = await response.json();

    currentPuzzleId = puzzle.puzzleId;
    emojiDisplay.textContent = puzzle.emoji;

    optionsContainer.innerHTML = '';
    puzzle.options.forEach((option, index) => {
        optionsContainer.insertAdjacentHTML('beforeend', `
      <label>
        <input type="radio" name="guess" id="option-${index}" value="${option}" required>
        ${option}
      </label><br>
    `);
    });
}

// Handles form submission: prevents the default page reload, then POSTs the guess
guessForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        feedback.textContent = 'Please enter your name first.';
        return;
    }

    const selected = guessForm.querySelector('input[name="guess"]:checked');
    if (!selected) return;

    const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playerName,
            puzzleId: currentPuzzleId,
            guess: selected.value
        })
    });

    const result = await response.json();

    score = result.score;
    scoreDisplay.textContent = score;
    feedback.textContent = result.correct ?
        'Correct!' :
        `Wrong! The correct answer was "${result.correctAnswer}".`;

    await loadLeaderboard();
    await loadNewPuzzle();
});

// Fetches and renders the current top scores
async function loadLeaderboard() {
    const response = await fetch('/api/leaderboard');
    const leaderboard = await response.json();

    leaderboardList.innerHTML = leaderboard
        .map(entry => `<li>${entry.name}: ${entry.score}</li>`)
        .join('');
}

// Initial load when the page first opens
loadNewPuzzle();
loadLeaderboard();