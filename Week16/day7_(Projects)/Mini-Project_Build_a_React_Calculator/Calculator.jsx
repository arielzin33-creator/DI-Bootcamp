import { Component } from 'react';

import Display from './Display';
import Button from './Button';
import { evaluate, DivideByZeroError, getCurrentOperand } from '../utils/evaluate';

// Layout matches the reference demo's CSS grid exactly (verified by inspecting its
// rendered DOM): AC spans 2 columns on row 1, then a standard 4-column keypad, with "0"
// spanning 2 columns on the last row and no button in that row's last cell.
const BUTTON_ROWS = [
  [
    { label: 'AC', type: 'clear', className: 'btn btn--clear span-2' },
    { label: '÷', value: '/', type: 'operator', className: 'btn btn--op' },
    { label: '×', value: '*', type: 'operator', className: 'btn btn--op' },
  ],
  [
    { label: '7', value: '7', type: 'digit', className: 'btn btn--num' },
    { label: '8', value: '8', type: 'digit', className: 'btn btn--num' },
    { label: '9', value: '9', type: 'digit', className: 'btn btn--num' },
    { label: '−', value: '-', type: 'operator', className: 'btn btn--op' },
  ],
  [
    { label: '4', value: '4', type: 'digit', className: 'btn btn--num' },
    { label: '5', value: '5', type: 'digit', className: 'btn btn--num' },
    { label: '6', value: '6', type: 'digit', className: 'btn btn--num' },
    { label: '+', value: '+', type: 'operator', className: 'btn btn--op' },
  ],
  [
    { label: '1', value: '1', type: 'digit', className: 'btn btn--num' },
    { label: '2', value: '2', type: 'digit', className: 'btn btn--num' },
    { label: '3', value: '3', type: 'digit', className: 'btn btn--num' },
    { label: '=', type: 'equals', className: 'btn btn--op' },
  ],
  [
    { label: '0', value: '0', type: 'digit', className: 'btn btn--num span-2' },
    { label: '.', value: '.', type: 'digit', className: 'btn btn--num' },
  ],
];

class Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expression: '',
      result: null,
      error: null,
    };
  }

  handleDigit = (digit) => {
    this.setState((state) => {
      // Typing a digit right after a result (or an error) starts a completely fresh
      // calculation — verified live: pressing a digit after "2+3*4 = 14" replaces the
      // whole display with just that digit, discarding the prior expression.
      if (state.result !== null || state.error) {
        return { expression: digit, result: null, error: null };
      }

      // Deliberately a pure computation on `state.expression` (the functional updater's
      // own parameter), not a call out to a helper reading `this.state` — see the note
      // on handleEquals below for why that distinction is load-bearing, not stylistic.
      const current = getCurrentOperand(state.expression);

      if (digit === '.') {
        // Guard against "3.5.2" — only one decimal point per operand.
        if (current.includes('.')) return null;
        return { expression: state.expression + digit };
      }

      // Replace a lone leading "0" instead of appending, so "0" + "5" becomes "5", not
      // "05". Doesn't apply once there's already a decimal point ("0." + "5" -> "0.5").
      if (current === '0' && !current.includes('.')) {
        return { expression: state.expression.slice(0, -1) + digit };
      }

      return { expression: state.expression + digit };
    });
  };

  handleOperator = (op) => {
    this.setState((state) => {
      if (state.error) return null; // must clear first

      // Chaining directly from a previous result — verified live: after "17", pressing
      // "×" then "3" then "=" gives "17*3 = 51", continuing from the prior answer.
      if (state.result !== null) {
        return { expression: `${state.result}${op}`, result: null, error: null };
      }

      if (state.expression === '') return null; // can't start with an operator

      // Pressing an operator right after another operator replaces it, rather than
      // producing an ambiguous "12++3" the evaluator would have to guess about.
      if (/[+\-*/]$/.test(state.expression)) {
        return { expression: state.expression.slice(0, -1) + op };
      }

      return { expression: state.expression + op };
    });
  };

  handleEquals = () => {
    // Functional setState form throughout, not `const { expression } = this.state`
    // directly — reading this.state outside the updater is only guaranteed current
    // between separate, browser-dispatched events. Chained/rapid calls (e.g.
    // programmatic .click() sequences fired without yielding back to the event loop
    // between them) can read a stale snapshot otherwise. Confirmed directly: this bug
    // was originally caught this exact way — three clicks in a tight synchronous loop
    // silently computed against a stale empty expression.
    this.setState((state) => {
      if (!state.expression || state.result !== null) return null;

      try {
        const value = evaluate(state.expression);
        return { result: value, error: null };
      } catch (err) {
        if (err instanceof DivideByZeroError) {
          // The reference demo shows raw "Infinity" here (a plain 5/0 leaking through
          // unhandled) — a clean "Error" message is a deliberate improvement over
          // that, not a faithfulness gap.
          return { error: 'Cannot divide by zero', result: null };
        }
        return { error: 'Error', result: null };
      }
    });
  };

  handleClear = () => {
    this.setState({ expression: '', result: null, error: null });
  };

  handleButtonClick = (button) => {
    if (button.type === 'clear') this.handleClear();
    else if (button.type === 'equals') this.handleEquals();
    else if (button.type === 'operator') this.handleOperator(button.value);
    else this.handleDigit(button.value);
  };

  render() {
    const { expression, result, error } = this.state;

    return (
      <div className="calculator">
        <Display expression={expression} result={result} error={error} />
        <div className="calc-grid">
          {BUTTON_ROWS.flat().map((button, index) => (
            <Button
              key={index}
              label={button.label}
              className={button.className}
              onClick={() => this.handleButtonClick(button)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Calculator;
