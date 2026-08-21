function Cell({ value, onClick, isWinning, disabled }) {
  const classes = ['cell'];
  if (value === 'X') classes.push('cell--x');
  if (value === 'O') classes.push('cell--o');
  if (isWinning) classes.push('cell--winning');

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={value ? `Cell marked ${value}` : 'Empty cell'}
    >
      {value}
    </button>
  );
}

export default Cell;
