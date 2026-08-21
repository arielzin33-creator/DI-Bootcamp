import { checkWinner, isDraw, getAiMove, PATTERNS, X, O } from './src/utils/gameLogic.js';
import assert from 'node:assert';

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '-', e.message); fail++; }
}

const n = null;

check('PATTERNS matches the brief exactly', () => {
  assert.deepStrictEqual(PATTERNS, [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ]);
});

check('detects a horizontal win', () => {
  const board = [X, X, X, n, n, n, n, n, n];
  const result = checkWinner(board);
  assert.strictEqual(result.winner, X);
  assert.deepStrictEqual(result.line, [0, 1, 2]);
});

check('detects a vertical win', () => {
  const board = [O, n, n, O, n, n, O, n, n];
  assert.strictEqual(checkWinner(board).winner, O);
});

check('detects a diagonal win', () => {
  const board = [X, n, n, n, X, n, n, n, X];
  assert.strictEqual(checkWinner(board).winner, X);
});

check('detects the OTHER diagonal', () => {
  const board = [n, n, O, n, O, n, O, n, n];
  assert.strictEqual(checkWinner(board).winner, O);
});

check('no winner on an empty board', () => {
  assert.strictEqual(checkWinner(Array(9).fill(null)), null);
});

check('no false positive on a near-miss (two in a row, not three)', () => {
  const board = [X, X, n, n, n, n, n, n, n];
  assert.strictEqual(checkWinner(board), null);
});

check('isDraw: true on a full board with no winner', () => {
  // X O X / X X O / O X O -- the exact draw board verified live on the reference demo
  const board = [X, O, X, X, X, O, O, X, O];
  assert.strictEqual(checkWinner(board), null);
  assert.strictEqual(isDraw(board), true);
});

check('isDraw: false when the board still has empty cells', () => {
  const board = [X, O, n, n, n, n, n, n, n];
  assert.strictEqual(isDraw(board), false);
});

check('isDraw: false when the board is full but someone won', () => {
  const board = [X, X, X, O, O, n, n, n, n];
  assert.strictEqual(isDraw(board), false);
});

console.log('\n--- AI move logic ---');

check('AI takes the winning move when available (verified priority #1)', () => {
  // O has two in a row at 3,4 -- O should take 5 to win, not block or play center
  const board = [X, X, n, O, O, n, n, n, n];
  const move = getAiMove(board, O, X);
  assert.strictEqual(move, 5);
});

check('AI blocks an immediate opponent win when it cannot win itself', () => {
  // X has two in a row at 0,1 -- O must block at 2
  const board = [X, X, n, n, n, n, n, n, n];
  const move = getAiMove(board, O, X);
  assert.strictEqual(move, 2);
});

check('AI prefers winning over blocking when both are available', () => {
  // O can win at 8 (via 2,5,8) AND must block X's win at 6 (via 0,3,6) -- winning takes priority
  const board = [X, n, O, X, n, O, n, n, n];
  const move = getAiMove(board, O, X);
  assert.strictEqual(move, 8);
});

check('AI opens in the center on an empty board (matches the live demo)', () => {
  const board = Array(9).fill(null);
  const move = getAiMove(board, O, X);
  assert.strictEqual(move, 4);
});

check('AI picks a corner when center is taken and no win/block applies', () => {
  const board = [n, n, n, n, X, n, n, n, n]; // center already taken by X
  const move = getAiMove(board, O, X);
  assert.ok([0, 2, 6, 8].includes(move), `expected a corner, got ${move}`);
});

check('AI never picks an already-occupied cell', () => {
  const board = [X, O, X, O, X, O, X, O, n]; // only cell 8 is open
  const move = getAiMove(board, O, X);
  assert.strictEqual(move, 8);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
