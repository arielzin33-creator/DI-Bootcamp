import { useEffect, useState } from 'react';

import Header from './components/Header';
import Controls from './components/Controls';
import Board from './components/Board';
import StatusMessage from './components/StatusMessage';
import { checkWinner, isDraw, getAiMove, X, O } from './utils/gameLogic';
import './App.css';

const EMPTY_BOARD = Array(9).fill(null);

function App() {
  // State variable names follow the brief's own suggestion directly.
  const [mode, setMode] = useState('AI'); // 'AI' | '2P' -- defaults to AI, matching the reference demo
  const [turn, setTurn] = useState(X); // X always goes first
  const [active, setActive] = useState(true); // false once the game has ended (win or draw)
  const [boardState, setBoardState] = useState(EMPTY_BOARD);

  const result = checkWinner(boardState);
  const draw = !result && isDraw(boardState);

  function placeMark(index) {
    setBoardState((prev) => {
      if (prev[index] !== null) return prev; // guard against double-processing a click
      const next = prev.slice();
      next[index] = turn;
      return next;
    });
    setTurn((prev) => (prev === X ? O : X));
  }

  function handleCellClick(index) {
    if (!active || boardState[index] !== null) return;
    // In AI mode the human always plays X; an O-turn cell click means it's the AI's
    // turn to move, not the human's, so clicks are ignored until the AI has replied.
    if (mode === 'AI' && turn === O) return;
    placeMark(index);
  }

  // Ends the game exactly once, the turn a win or draw actually occurs — not on every
  // render, and not for stale boards left over from before a reset.
  useEffect(() => {
    if (checkWinner(boardState) || isDraw(boardState)) {
      setActive(false);
    }
  }, [boardState]);

  // Drives the AI's move automatically whenever it becomes O's turn in AI mode. A
  // short delay makes the AI's response feel like a deliberate move rather than an
  // instant reflex — a deliberate UX addition beyond the reference demo, which replies
  // immediately.
  //
  // The game-over check happens TWICE on purpose: once here (skip scheduling
  // entirely if the game already looks over) and again inside the timeout callback
  // itself. Both matter — a human win sets boardState and turn=O in the same batched
  // update, and this effect can still run in that same commit with `active` closed
  // over from *before* the sibling "end game" effect has set it to false. Without the
  // second check, that stale closure would let the AI schedule and then place a move
  // after the game had already been won. Re-deriving winner/draw from the live board
  // inside the callback — rather than trusting the effect's captured `active` — closes
  // that gap regardless of the exact order React happens to run same-commit effects in.
  useEffect(() => {
    if (mode !== 'AI' || !active || turn !== O) return;
    if (checkWinner(boardState) || isDraw(boardState)) return;

    const timer = setTimeout(() => {
      setBoardState((prev) => {
        if (checkWinner(prev) || isDraw(prev)) return prev; // game ended before this fired
        const move = getAiMove(prev, O, X);
        if (move === undefined || move === null || prev[move] !== null) return prev;
        const next = prev.slice();
        next[move] = O;
        return next;
      });
      setTurn(X);
    }, 400);

    return () => clearTimeout(timer);
  }, [mode, active, turn, boardState]);

  function resetGame() {
    setBoardState(EMPTY_BOARD);
    setTurn(X);
    setActive(true);
  }

  // Switching modes mid-game would leave an ambiguous "whose AI is it now" state, so
  // it starts a fresh game — a deliberate choice, not something observed on the demo
  // (never tested there).
  function handleModeChange(newMode) {
    if (newMode === mode) return;
    setMode(newMode);
    resetGame();
  }

  return (
    <div className="app">
      <Header />
      <Controls mode={mode} onModeChange={handleModeChange} onReset={resetGame} />
      <StatusMessage turn={turn} winner={result?.winner} isDraw={draw} active={active} />
      <Board
        board={boardState}
        onCellClick={handleCellClick}
        winningLine={result?.line}
        gameOver={!active}
      />
    </div>
  );
}

export default App;
