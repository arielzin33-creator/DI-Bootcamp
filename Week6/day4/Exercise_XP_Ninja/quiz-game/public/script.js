let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let answered = false;

const questionCounterEl = document.getElementById('question-counter');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const feedbackEl = document.getElementById('feedback');
const quizScreenEl = document.getElementById('quiz-screen');
const resultScreenEl = document.getElementById('result-screen');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        questions = await response.json();
        displayQuestion();
    } catch (error) {
        questionTextEl.textContent = 'Failed to load questions. Please refresh the page.';
        console.error('Error loading questions:', error);
    }
}

function displayQuestion() {
    answered = false;
    selectedOptionIndex = null;
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submit Answer';

    const currentQuestion = questions[currentQuestionIndex];

    questionCounterEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionTextEl.textContent = currentQuestion.question;

    optionsContainerEl.innerHTML = '';

    currentQuestion.options.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = optionText;
        btn.addEventListener('click', () => selectOption(index, btn));
        optionsContainerEl.appendChild(btn);
    });
}

function selectOption(index, buttonEl) {
    if (answered) return; // prevent changing selection after submission

    // Clear previous selection styling
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));

    buttonEl.classList.add('selected');
    selectedOptionIndex = index;
    submitBtn.disabled = false;
}

async function submitAnswer() {
    if (selectedOptionIndex === null || answered) return;

    const currentQuestion = questions[currentQuestionIndex];

    try {
        const response = await fetch(`/api/questions/${currentQuestion.id}/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedOption: selectedOptionIndex })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        answered = true;

        const optionButtons = document.querySelectorAll('.option-btn');

        optionButtons.forEach((btn, index) => {
            btn.disabled = true;

            if (index === result.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === selectedOptionIndex && !result.isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (result.isCorrect) {
            score += 1;
            feedbackEl.textContent = 'Correct! 🎉';
            feedbackEl.classList.add('correct');
        } else {
            feedbackEl.textContent = 'Incorrect.';
            feedbackEl.classList.add('incorrect');
        }

        submitBtn.textContent =
            currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz';
        submitBtn.disabled = false;

    } catch (error) {
        feedbackEl.textContent = 'Something went wrong submitting your answer.';
        console.error('Error submitting answer:', error);
    }
}

function goToNextQuestion() {
    currentQuestionIndex += 1;

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showFinalScore();
    }
}

function showFinalScore() {
    quizScreenEl.classList.add('hidden');
    resultScreenEl.classList.remove('hidden');
    finalScoreEl.textContent = `You scored ${score} out of ${questions.length}!`;
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultScreenEl.classList.add('hidden');
    quizScreenEl.classList.remove('hidden');
    displayQuestion();
}

submitBtn.addEventListener('click', () => {
    if (!answered) {
        submitAnswer();
    } else {
        goToNextQuestion();
    }
});

restartBtn.addEventListener('click', restartQuiz);

// Kick off the quiz on page load
loadQuestions();