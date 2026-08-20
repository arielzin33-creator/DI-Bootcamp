import { useState } from 'react';

type Action = 'increment' | 'decrement' | null;

export default function Counter() {
  const [count, setCount] = useState<number>(0);
  const [lastAction, setLastAction] = useState<Action>(null);

  const increment = (): void => {
    setCount((current) => current + 1);
    setLastAction('increment');
  };

  const decrement = (): void => {
    setCount((current) => current - 1);
    setLastAction('decrement');
  };

  return (
    <div className="counter">
      <p className="counter__value" aria-live="polite">
        {count}
      </p>

      <div className="counter__buttons">
        <button type="button" onClick={decrement} aria-label="Decrement">
          −
        </button>
        <button type="button" onClick={increment} aria-label="Increment">
          +
        </button>
      </div>

      <p className="counter__last-action">
        Last action: {lastAction === null ? 'none yet' : lastAction}
      </p>
    </div>
  );
}
