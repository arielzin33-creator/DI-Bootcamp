// As given in the brief.
export const PATTERNS = [
  // horizontal
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  // vertical
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  // diagonal
  [0, 4, 8],
  [2, 4, 6],
];

export const X = 'X';
export const O = 'O';

// Returns { winner: 'X'|'O', line: [i,j,k] } or null if nobody has won yet.
export function checkWinner(board) {
  for (const line of PATTERNS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

export function isDraw(board) {
  return board.every((cell) => cell !== null) && !checkWinner(board);
}

function emptyCells(board) {
  return board.reduce((acc, cell, i) => {
    if (cell === null) acc.push(i);
    return acc;
  }, []);
}

// Would placing `symbol` at every remaining empty cell produce a win? Used for both
// "can I win right now" and "does the opponent win if I don't block them" — same
// question, asked about a different symbol.
function findWinningMove(board, symbol) {
  for (const i of emptyCells(board)) {
    const copy = board.slice();
    copy[i] = symbol;
    if (checkWinner(copy)) return i;
  }
  return null;
}

const CENTER = 4;
const CORNERS = [0, 2, 6, 8];

// Not unbeatable (no full minimax) but not naive either — verified against the
// reference demo's own observed behavior: it opens in the center, and blocks an
// immediate opponent win rather than playing randomly. This follows the same
// priority order: win if possible, else block, else center, else a corner, else
// whatever's left.
export function getAiMove(board, aiSymbol, humanSymbol) {
  const winningMove = findWinningMove(board, aiSymbol);
  if (winningMove !== null) return winningMove;

  const blockingMove = findWinningMove(board, humanSymbol);
  if (blockingMove !== null) return blockingMove;

  if (board[CENTER] === null) return CENTER;

  const openCorners = CORNERS.filter((i) => board[i] === null);
  if (openCorners.length > 0) {
    return openCorners[Math.floor(Math.random() * openCorners.length)];
  }

  const remaining = emptyCells(board);
  return remaining[Math.floor(Math.random() * remaining.length)];
}
