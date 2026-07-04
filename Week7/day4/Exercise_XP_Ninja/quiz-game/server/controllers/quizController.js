const quizModel = require('../models/quizModel');

// Memory storage for simple single-session state tracking per assignment spec
let currentQuestions = [];
let currentIndex = 0;
let userScore = 0;

const startQuiz = async (req, res, next) => {
    try {
        currentQuestions = await quizModel.getQuizData();
        currentIndex = 0;
        userScore = 0;
        
        if (currentQuestions.length === 0) {
            return res.status(404).json({ error: 'No quiz questions available' });
        }
        
        res.status(200).json({
            question: currentQuestions[currentIndex].question,
            options: currentQuestions[currentIndex].options,
            index: currentIndex,
            total: currentQuestions.length
        });
    } catch (err) { next(err); }
};

const submitAnswer = (req, res) => {
    const { answer } = req.body;
    
    if (currentIndex >= currentQuestions.length) {
        return res.status(400).json({ error: 'Quiz is already complete' });
    }
    
    const currentQ = currentQuestions[currentIndex];
    const isCorrect = (answer === currentQ.correct_answer);
    
    if (isCorrect) {
        userScore++;
    }
    
    currentIndex++;
    
    const isFinished = currentIndex >= currentQuestions.length;
    
    res.status(200).json({
        correct: isCorrect,
        correctAnswer: currentQ.correct_answer,
        score: userScore,
        isFinished: isFinished,
        nextQuestion: isFinished ? null : {
            question: currentQuestions[currentIndex].question,
            options: currentQuestions[currentIndex].options,
            index: currentIndex,
            total: currentQuestions.length
        }
    });
};

module.exports = { startQuiz, submitAnswer };
