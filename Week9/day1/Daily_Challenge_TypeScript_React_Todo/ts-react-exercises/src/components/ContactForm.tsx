/**
 * Exercise (Set 3) 3: Managing Form State with useReducer
 *
 * This is a simple "contact us" message form — distinct from the global
 * Contacts list built in Exercise (Set 3) 4. Demonstrates:
 * - A single ContactFormAction ('updateField') parameterized by
 *   `field: keyof ContactFormState`, so a caller can't dispatch an update
 *   for a field that doesn't exist on the form.
 * - `resetForm` returning the reducer to its initial state.
 */

import { useReducer } from 'react';
import type { ChangeEvent } from 'react';

interface ContactFormState {
  name: string;
  email: string;
  message: string;
}

type ContactFormAction =
  | { type: 'updateField'; field: keyof ContactFormState; value: string }
  | { type: 'resetForm' };

const initialContactFormState: ContactFormState = {
  name: '',
  email: '',
  message: '',
};

function contactFormReducer(
  state: ContactFormState,
  action: ContactFormAction
): ContactFormState {
  switch (action.type) {
    case 'updateField':
      return { ...state, [action.field]: action.value };
    case 'resetForm':
      return initialContactFormState;
    default:
      return state;
  }
}

function ContactForm() {
  const [state, dispatch] = useReducer(contactFormReducer, initialContactFormState);

  const handleFieldChange =
    (field: keyof ContactFormState) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      dispatch({ type: 'updateField', field, value: event.target.value });
    };

  const isComplete = Boolean(state.name.trim() && state.email.trim() && state.message.trim());

  return (
    <div className="card">
      <div className="form-field">
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" value={state.name} onChange={handleFieldChange('name')} />
      </div>
      <div className="form-field">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" value={state.email} onChange={handleFieldChange('email')} />
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">Message</label>
        <input
          id="contact-message"
          value={state.message}
          onChange={handleFieldChange('message')}
        />
      </div>

      <div className="button-row">
        <button type="button" onClick={() => dispatch({ type: 'resetForm' })}>
          Reset
        </button>
      </div>

      <p className="muted">
        {isComplete ? 'All fields filled in.' : 'Fill in name, email, and message.'}
      </p>
    </div>
  );
}

export default ContactForm;
