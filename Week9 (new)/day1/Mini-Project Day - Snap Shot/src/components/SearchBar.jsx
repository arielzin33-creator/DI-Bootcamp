import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchBar({ initialValue = '' }) {
  const [term, setTerm] = useState(initialValue)
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = term.trim()
    if (!trimmed) return
    navigate(`/SnapScout/${encodeURIComponent(trimmed)}`)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Search for an image type..."
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  )
}

export default SearchBar
