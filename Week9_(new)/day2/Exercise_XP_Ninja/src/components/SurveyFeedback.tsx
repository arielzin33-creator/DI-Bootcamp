import { useReducer, useState, type FormEvent } from 'react'
import { surveyReducer, initialSurveyState } from '../reducers/surveyReducer'

function SurveyFeedback() {
  const [state, dispatch] = useReducer(surveyReducer, initialSurveyState)
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    dispatch({ type: 'SUBMIT_FEEDBACK', payload: draft })
  }

  const handleReset = (): void => {
    setDraft('')
    dispatch({ type: 'RESET' })
  }

  return (
    <div className="survey-feedback">
      {state.status === 'initial' && (
        <button type="button" onClick={() => dispatch({ type: 'START_SURVEY' })}>
          Start Survey
        </button>
      )}

      {state.status === 'submitting' && (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="survey-feedback">How was your experience?</label>
            <textarea
              id="survey-feedback"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="submit">Submit Feedback</button>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      )}

      {state.status === 'completed' && (
        <div>
          <p className="status-message success">Thanks for your feedback: "{state.feedback}"</p>
          <button type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

export default SurveyFeedback
