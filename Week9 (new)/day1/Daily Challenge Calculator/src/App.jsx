import { useState } from 'react'
import './App.css'

const OPERATIONS = {
  add: { label: 'Addition (+)', symbol: '+', compute: (a, b) => a + b },
  subtract: { label: 'Subtraction (−)', symbol: '−', compute: (a, b) => a - b },
  multiply: { label: 'Multiplication (×)', symbol: '×', compute: (a, b) => a * b },
  divide: { label: 'Division (÷)', symbol: '÷', compute: (a, b) => a / b },
}

function App() {
  const [firstNumber, setFirstNumber] = useState('')
  const [secondNumber, setSecondNumber] = useState('')
  const [operation, setOperation] = useState('add')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleCalculate = () => {
    const a = parseFloat(firstNumber)
    const b = parseFloat(secondNumber)

    if (Number.isNaN(a) || Number.isNaN(b)) {
      setError('Please enter two valid numbers.')
      setResult(null)
      return
    }

    if (operation === 'divide' && b === 0) {
      setError('Cannot divide by zero.')
      setResult(null)
      return
    }

    setError(null)
    setResult(OPERATIONS[operation].compute(a, b))
  }

  return (
    <div className="calculator">
      <h1>React Calculator</h1>

      <div className="inputs">
        <input
          type="number"
          placeholder="First number"
          value={firstNumber}
          onChange={(e) => setFirstNumber(e.target.value)}
        />

        <select value={operation} onChange={(e) => setOperation(e.target.value)}>
          {Object.entries(OPERATIONS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Second number"
          value={secondNumber}
          onChange={(e) => setSecondNumber(e.target.value)}
        />
      </div>

      <button onClick={handleCalculate}>Add Them</button>

      {error && <p className="error">{error}</p>}

      {result !== null && !error && (
        <p className="result">
          {firstNumber} {OPERATIONS[operation].symbol} {secondNumber} ={' '}
          <strong>{result}</strong>
        </p>
      )}
    </div>
  )
}

export default App
