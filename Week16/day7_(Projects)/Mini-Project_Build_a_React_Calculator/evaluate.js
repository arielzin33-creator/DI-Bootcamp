// A small, dependency-free expression evaluator for strings built purely from calculator
// button presses (digits, ".", "+", "-", "*", "/"). Deliberately NOT using `eval()` — even
// though the input here is fully constrained by the button set (no injection surface),
// avoiding eval is the correct default and costs nothing given how small this grammar is.
//
// Respects standard operator precedence (* and / before + and -), matching the reference
// demo's behavior (verified live: "2+3*4" -> 14, not 20).

export class DivideByZeroError extends Error {}

// The operand currently being typed — the substring of the expression after its last
// operator. Shared between Calculator (input-guard logic) and Display (rendering), so
// there's exactly one definition of "what the user is currently typing."
export function getCurrentOperand(expression) {
  const parts = expression.split(/[+\-*/]/);
  return parts[parts.length - 1] || '';
}

export function evaluate(expression) {
  const tokens = expression.match(/(\d+\.?\d*)|[+\-*/]/g);
  if (!tokens || tokens.length === 0) return 0;

  // A trailing operator (user pressed "=" right after an operator, e.g. "12+") has no
  // right-hand operand to act on — dropped rather than thrown, so "=" is a no-op instead
  // of crashing.
  if (/[+\-*/]/.test(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  if (tokens.length === 0) return 0;

  // Pass 1: resolve * and / left-to-right, collapsing each into a single number so only
  // + and - are left for pass 2.
  const pass1 = [tokens[0]];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const next = Number(tokens[i + 1]);
    if (op === '*' || op === '/') {
      const prev = Number(pass1.pop());
      if (op === '/' && next === 0) throw new DivideByZeroError('Cannot divide by zero');
      pass1.push(String(op === '*' ? prev * next : prev / next));
    } else {
      pass1.push(op, tokens[i + 1]);
    }
  }

  // Pass 2: resolve the remaining + and - left-to-right.
  let result = Number(pass1[0]);
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i];
    const next = Number(pass1[i + 1]);
    result = op === '+' ? result + next : result - next;
  }

  // Guards against floating-point noise (0.1 + 0.2 -> 0.30000000000000004) without
  // truncating results that legitimately need many decimal places.
  return Math.round(result * 1e10) / 1e10;
}
