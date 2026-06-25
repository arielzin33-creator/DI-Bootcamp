// routes/quizRoutes.js

const express = require("express");
const router = express.Router();
const triviaQuestions = require("../models/triviaModel");
const { quizState, resetQuizState } = require("../state/quizState");

// GET /quiz - Start the quiz and display the first (or current) question
router.get("/quiz", (req, res) => {
    // Start a new quiz if one hasn't started yet, or if the previous one finished
    if (!quizState.started || quizState.quizFinished) {
        resetQuizState();
    }

    const index = quizState.currentQuestionIndex;

    if (index >= triviaQuestions.length) {
        quizState.quizFinished = true;
        return res.json({
            message: "Quiz already completed.",
            score: quizState.score,
            total: triviaQuestions.length,
            nextStep: "GET /quiz/score",
        });
    }

    res.json({
        questionNumber: index + 1,
        totalQuestions: triviaQuestions.length,
        question: triviaQuestions[index].question,
    });
});

// POST /quiz - Submit an answer and move to the next question
router.post("/quiz", (req, res) => {
    const { answer } = req.body;

    if (!quizState.started || quizState.quizFinished) {
        return res.status(400).json({
            message: "Quiz not started. Send a GET request to /quiz first.",
        });
    }

    if (answer === undefined || answer === null || answer.trim() === "") {
        return res.status(400).json({ message: "Answer is required." });
    }

    const index = quizState.currentQuestionIndex;

    if (index >= triviaQuestions.length) {
        quizState.quizFinished = true;
        return res.json({
            message: "Quiz already completed.",
            score: quizState.score,
            total: triviaQuestions.length,
        });
    }

    const currentQuestion = triviaQuestions[index];
    const isCorrect =
        answer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();

    if (isCorrect) {
        quizState.score += 1;
    }

    quizState.currentQuestionIndex += 1;

    const quizIsOver = quizState.currentQuestionIndex >= triviaQuestions.length;
    if (quizIsOver) {
        quizState.quizFinished = true;
    }

    const feedback = isCorrect ?
        "Correct!" :
        `Incorrect. The correct answer was "${currentQuestion.answer}".`;

    if (quizIsOver) {
        return res.json({
            feedback,
            message: "Quiz completed!",
            score: quizState.score,
            total: triviaQuestions.length,
            nextStep: "GET /quiz/score",
        });
    }

    const nextQuestion = triviaQuestions[quizState.currentQuestionIndex];
    res.json({
        feedback,
        nextQuestionNumber: quizState.currentQuestionIndex + 1,
        totalQuestions: triviaQuestions.length,
        nextQuestion: nextQuestion.question,
    });
});

// GET /quiz/score - Display the user's final score
router.get("/quiz/score", (req, res) => {
    if (!quizState.started) {
        return res.status(400).json({
            message: "No quiz in progress. Start one with GET /quiz.",
        });
    }

    res.json({
        score: quizState.score,
        total: triviaQuestions.length,
        completed: quizState.quizFinished,
    });
});

module.exports = router;