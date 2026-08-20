/**
 * Exercise 3: Using useState Hook with TypeScript in React
 *
 * This component demonstrates:
 * - Typing useState<number> and useState<LastAction> explicitly
 * - A union type (LastAction) to constrain the "last action" value
 * - Typed event handler functions for increment/decrement
 */

import { useState } from 'react';

// Union type: the last action can only ever be one of these three values.
type LastAction = 'increment' | 'decrement' | 'none';

function Counter() {
  const [count, setCount] = useState<number>(0);
  const [lastAction, setLastAction] = useState<LastAction>('none');

  const handleIncrement = (): void => {
    setCount((prev) => prev + 1);
    setLastAction('increment');
  };

  const handleDecrement = (): void => {
    setCount((prev) => prev - 1);
    setLastAction('decrement');
  };

  const handleReset = (): void => {
    setCount(0);
    setLastAction('none');
  };

  return (
    <div className="card">
      <h2>Counter</h2>
      <p className="counter-value">{count}</p>
      <div className="button-row">
        <button onClick={handleDecrement}>− Decrement</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleIncrement}>+ Increment</button>
      </div>
      <p>
        Last action: <strong>{lastAction}</strong>
      </p>
    </div>
  );
}

export default Counter;
