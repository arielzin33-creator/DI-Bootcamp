// state/quizState.js

// In-memory state (no sessions). This is shared globally,
// so it is suitable only for a single-user/demo setup.
const quizState = {
    currentQuestionIndex: 0,
    score: 0,
    quizFinished: false,
    started: false,
};

function resetQuizState() {
    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.quizFinished = false;
    quizState.started = true;
}

module.exports = { quizState, resetQuizState };