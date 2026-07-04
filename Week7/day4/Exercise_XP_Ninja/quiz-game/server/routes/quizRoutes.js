const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/api/quiz/start', quizController.startQuiz);
router.post('/api/quiz/submit', quizController.submitAnswer);

module.exports = router;
