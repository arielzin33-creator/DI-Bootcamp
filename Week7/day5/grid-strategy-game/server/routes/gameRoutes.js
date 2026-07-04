const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/start', gameController.startNewGame);
router.post('/move', gameController.processPlayerMove);
router.get('/status', gameController.getGameStatus);

module.exports = router;
