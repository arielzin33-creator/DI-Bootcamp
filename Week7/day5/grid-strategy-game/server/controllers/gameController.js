// Session State Structure
let gameState = {
    initialized: false,
    turn: 'p1', // Alternates between 'p1' and 'p2'
    winner: null,
    players: {
        p1: { name: '', position: { row: 0, col: 0 } },
        p2: { name: '', position: { row: 9, col: 9 } }
    },
    bases: {
        p1: { row: 0, col: 0 },
        p2: { row: 9, col: 9 }
    },
    obstacles: [
        { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 7 }, { row: 2, col: 8 },
        { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 5 },
        { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 7 }, { row: 7, col: 8 }
    ]
};

const startNewGame = (req, res) => {
    const { player1, player2 } = req.body;
    if (!player1 || !player2) {
        return res.status(400).json({ error: 'Two players are required to initialize a board strategy session.' });
    }

    // Reset layout board matrix state constraints entirely
    gameState = {
        initialized: true,
        turn: 'p1',
        winner: null,
        players: {
            p1: { name: player1, position: { row: 0, col: 0 } },
            p2: { name: player2, position: { row: 9, col: 9 } }
        },
        bases: {
            p1: { row: 0, col: 0 },
            p2: { row: 9, col: 9 }
        },
        obstacles: [
            { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 7 }, { row: 2, col: 8 },
            { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 5 },
            { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 7 }, { row: 7, col: 8 }
        ]
    };

    res.status(200).json({ message: 'Strategy matrix environment synchronized', state: gameState });
};

const processPlayerMove = (req, res) => {
    if (!gameState.initialized) {
        return res.status(400).json({ error: 'Game board session not initialized yet.' });
    }
    if (gameState.winner) {
        return res.status(400).json({ error: 'Match finalized. The game has concluded.', state: gameState });
    }

    const { direction } = req.body;
    const activePlayerKey = gameState.turn;
    const opponentPlayerKey = activePlayerKey === 'p1' ? 'p2' : 'p1';
    
    let currentPos = { ...gameState.players[activePlayerKey].position };

    // Vector mapping configuration step modifications
    switch (direction) {
        case 'up': currentPos.row -= 1; break;
        case 'down': currentPos.row += 1; break;
        case 'left': currentPos.col -= 1; break;
        case 'right': currentPos.col += 1; break;
        default: return res.status(400).json({ error: 'Invalid vector direction identifier.' });
    }

    // Validation Check 1: Boundary constraints
    if (currentPos.row < 0 || currentPos.row > 9 || currentPos.col < 0 || currentPos.col > 9) {
        return res.status(400).json({ error: 'Movement blocked: Map boundary collision.' });
    }

    // Validation Check 2: Obstacle collision loops
    const hitObstacle = gameState.obstacles.some(obs => obs.row === currentPos.row && obs.col === currentPos.col);
    if (hitObstacle) {
        return res.status(400).json({ error: 'Movement blocked: Structural obstacle obstruction.' });
    }

    // Validation Check 3: Friendly base collision constraint
    const friendlyBase = gameState.bases[activePlayerKey];
    if (currentPos.row === friendlyBase.row && currentPos.col === friendlyBase.col) {
        return res.status(400).json({ error: 'Movement blocked: Target point matches friendly command base coordinate.' });
    }

    // Apply valid location state shift into layout mapping index parameters
    gameState.players[activePlayerKey].position = currentPos;

    // Victory Check Mechanic: Has current position stepped onto opponent base coordinate
    const targetEnemyBase = gameState.bases[opponentPlayerKey];
    if (currentPos.row === targetEnemyBase.row && currentPos.col === targetEnemyBase.col) {
        gameState.winner = gameState.players[activePlayerKey].name;
    }

    // Alternate turn token step sequence if no win achieved
    if (!gameState.winner) {
        gameState.turn = opponentPlayerKey;
    }

    res.status(200).json({ message: 'Movement vector processed', state: gameState });
};

const getGameStatus = (req, res) => {
    res.status(200).json({ state: gameState });
};

module.exports = { startNewGame, processPlayerMove, getGameStatus };
