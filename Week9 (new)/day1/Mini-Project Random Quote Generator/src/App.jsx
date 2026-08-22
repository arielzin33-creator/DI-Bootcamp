import { useState } from 'react'
import quotes from './QuotesDatabase'
import './App.css'

// Nice, readable colour palette to randomize into.
const COLORS = [
  '#2c3e50', '#8e44ad', '#2980b9', '#16a085', '#27ae60',
  '#d35400', '#c0392b', '#34495e', '#2980b9', '#e67e22',
  '#1abc9c', '#9b59b6', '#e74c3c', '#3498db', '#f39c12',
]

function getRandomIndex(max, exclude) {
  if (max <= 1) return 0
  let index
  do {
    index = Math.floor(Math.random() * max)
  } while (index === exclude)
  return index
}

function getRandomColor(exclude) {
  let color
  do {
    color = COLORS[Math.floor(Math.random() * COLORS.length)]
  } while (color === exclude && COLORS.length > 1)
  return color
}

function App() {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * quotes.length)
  )
  const [bgColor, setBgColor] = useState('#2c3e50')
  const [quoteColor, setQuoteColor] = useState('#ffffff')
  const [buttonColor, setButtonColor] = useState('#e67e22')

  const currentQuote = quotes[quoteIndex]

  const handleNewQuote = () => {
    setQuoteIndex((prevIndex) => getRandomIndex(quotes.length, prevIndex))
    setBgColor((prev) => getRandomColor(prev))
    setQuoteColor((prev) => getRandomColor(prev))
    setButtonColor((prev) => getRandomColor(prev))
  }

  return (
    <div className="app" style={{ backgroundColor: bgColor }}>
      <div className="quote-box">
        <h1 className="quote-text" style={{ color: quoteColor }}>
          “{currentQuote.quote}”
        </h1>
        <p className="quote-author">— {currentQuote.author}</p>
        <button
          className="quote-button"
          style={{ backgroundColor: buttonColor }}
          onClick={handleNewQuote}
        >
          New Quote
        </button>
      </div>
    </div>
  )
}

export default App
