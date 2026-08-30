import { useState } from 'react'

type Action = 'increment' | 'decrement' | null

function Counter() {
  const [count, setCount] = useState<number>(0)
  const [lastAction, setLastAction] = useState<Action>(null)

  const handleIncrement = (): void => {
    setCount((prev) => prev + 1)
    setLastAction('increment')
  }

  const handleDecrement = (): void => {
    setCount((prev) => prev - 1)
    setLastAction('decrement')
  }

  return (
    <div className="counter">
      <h2>Counter</h2>
      <p className="counter-value">{count}</p>
      <div className="counter-buttons">
        <button type="button" onClick={handleDecrement}>
          − Decrement
        </button>
        <button type="button" onClick={handleIncrement}>
          + Increment
        </button>
      </div>
      <p className="counter-last-action">
        Last action: <strong>{lastAction ?? 'none yet'}</strong>
      </p>
    </div>
  )
}

export default Counter
