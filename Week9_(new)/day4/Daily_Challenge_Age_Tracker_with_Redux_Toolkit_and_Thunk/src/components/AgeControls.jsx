import { useDispatch, useSelector } from 'react-redux'
import { ageUpAsync, ageDownAsync } from '../features/age/ageSlice'

function AgeControls() {
  const dispatch = useDispatch()
  const { loading, age } = useSelector((state) => state.age)

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className="age-controls" onSubmit={handleSubmit}>
      <button type="button" onClick={() => dispatch(ageDownAsync())} disabled={loading || age === 0}>
        Age Down
      </button>
      <button type="button" onClick={() => dispatch(ageUpAsync())} disabled={loading}>
        Age Up
      </button>
    </form>
  )
}

export default AgeControls
