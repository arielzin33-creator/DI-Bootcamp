import { getCurrentOperand } from '../utils/evaluate';

function Display({ expression, result, error }) {
  // Matches the reference demo exactly: the small top line shows the full expression,
  // and once "=" has been pressed, " = <result>" (or " = Error") is appended to it —
  // verified live: "12+5" becomes "12+5 = 17" after equals.
  const topLine = error
    ? `${expression} = Error`
    : result !== null
    ? `${expression} = ${result}`
    : expression;

  // Mirrors the last number being typed when there's no result yet — the large bottom
  // line always shows either that in-progress operand or the final result.
  const bottomLine = error
    ? 'Error'
    : result !== null
    ? String(result)
    : getCurrentOperand(expression) || '0';

  return (
    <div className="calc-display">
      <span className="calc-display__eq">{topLine}</span>
      <span className="calc-display__value">{bottomLine}</span>
    </div>
  );
}

export default Display;
