/**
 * Exercise (Set 3) 2: Managing Survey Feedback with useReducer and TypeScript
 *
 * This component demonstrates:
 * - SurveyStatus as a simple string-literal union ('initial' | 'submitting' | 'completed').
 * - A reducer that transitions between those three statuses on START/SUBMIT/RESET.
 * - Conditionally rendering a different UI for each status.
 */

import { useReducer, useState } from 'react';

type SurveyStatus = 'initial' | 'submitting' | 'completed';

interface SurveyState {
  status: SurveyStatus;
  feedback: string;
}

type SurveyAction =
  | { type: 'START' }
  | { type: 'SUBMIT'; payload: string }
  | { type: 'RESET' };

const initialSurveyState: SurveyState = { status: 'initial', feedback: '' };

function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'START':
      return { status: 'submitting', feedback: '' };
    case 'SUBMIT':
      return { status: 'completed', feedback: action.payload };
    case 'RESET':
      return initialSurveyState;
    default:
      return state;
  }
}

function SurveyFeedback() {
  const [state, dispatch] = useReducer(surveyReducer, initialSurveyState);
  const [draft, setDraft] = useState<string>('');

  const handleSubmit = (): void => {
    dispatch({ type: 'SUBMIT', payload: draft });
  };

  const handleReset = (): void => {
    setDraft('');
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="card">
      {state.status === 'initial' && (
        <button type="button" onClick={() => dispatch({ type: 'START' })}>
          Start survey
        </button>
      )}

      {state.status === 'submitting' && (
        <>
          <div className="form-field">
            <label htmlFor="survey-feedback">How was your experience?</label>
            <input
              id="survey-feedback"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          <div className="button-row">
            <button type="button" onClick={handleSubmit} disabled={!draft.trim()}>
              Submit feedback
            </button>
          </div>
        </>
      )}

      {state.status === 'completed' && (
        <>
          <p className="success-text">Thanks for your feedback: “{state.feedback}”</p>
          <div className="button-row">
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SurveyFeedback;
