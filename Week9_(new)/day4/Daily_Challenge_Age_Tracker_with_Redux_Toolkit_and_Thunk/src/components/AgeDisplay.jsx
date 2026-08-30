import { useSelector } from 'react-redux'

function AgeDisplay() {
  const { age, loading } = useSelector((state) => state.age)

  return (
    <div className="age-display">
      <p className="age-label">Current Age</p>
      <div className="age-value-row">
        <span className="age-value">{age}</span>
        {loading && <span className="spinner" aria-label="Loading" role="status" />}
      </div>
    </div>
  )
}

export default AgeDisplay
