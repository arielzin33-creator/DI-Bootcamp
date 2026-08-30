import Cell from './Cell';

// Explicitly built as 3 rows of 3 columns each (rather than one flat map over 9
// cells), per the brief's "create the rows and columns" instruction — the row
// grouping is real markup structure, not just a CSS grid trick over a flat list.
function Board({ board, onCellClick, winningLine, gameOver }) {
  const rows = [board.slice(0, 3), board.slice(3, 6), board.slice(6, 9)];

  return (
    <div className="board">
      {rows.map((row, rowIndex) => (
        <div className="board__row" key={rowIndex}>
          {row.map((value, colIndex) => {
            const cellIndex = rowIndex * 3 + colIndex;
            return (
              <div className="board__col" key={cellIndex}>
                <Cell
                  value={value}
                  onClick={() => onCellClick(cellIndex)}
                  isWinning={winningLine?.includes(cellIndex)}
                  disabled={gameOver}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Board;
