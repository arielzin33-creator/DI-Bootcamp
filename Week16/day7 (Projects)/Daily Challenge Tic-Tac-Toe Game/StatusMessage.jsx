function StatusMessage({ turn, winner, isDraw, active }) {
  if (winner) {
    return <p className="status status--win">{winner} wins!</p>;
  }
  if (isDraw) {
    return <p className="status status--draw">Game Over — It's a draw!</p>;
  }
  if (active) {
    return <p className="status status--turn">{turn}'s turn</p>;
  }
  return null;
}

export default StatusMessage;
