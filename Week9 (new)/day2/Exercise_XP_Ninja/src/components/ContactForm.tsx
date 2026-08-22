import { useReducer, type ChangeEvent } from 'react'
import {
  contactFormReducer,
  initialContactFormState,
  type ContactFormState,
} from '../reducers/contactFormReducer'

function ContactForm() {
  const [state, dispatch] = useReducer(contactFormReducer, initialContactFormState)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const field = event.target.name as keyof ContactFormState
    dispatch({ type: 'updateField', field, value: event.target.value })
  }

  const isEmpty = !state.name && !state.email && !state.message

  return (
    <div className="contact-form">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" value={state.name} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" value={state.email} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            value={state.message}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <button type="button" onClick={() => dispatch({ type: 'resetForm' })}>
          Reset
        </button>
      </form>

      <p className="status-message">
        {isEmpty ? 'Form is empty.' : `Current state: ${JSON.stringify(state)}`}
      </p>
    </div>
  )
}

export default ContactForm
