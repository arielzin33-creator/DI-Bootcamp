import { useContacts } from '../context/ContactContext'

function ContactList() {
  const { state, dispatch } = useContacts()

  if (state.contacts.length === 0) {
    return <p className="status-message">No contacts yet. Add one above.</p>
  }

  return (
    <ul className="contact-list">
      {state.contacts.map((contact) => (
        <li key={contact.id} className="contact-list-item">
          <span>
            <strong>{contact.name}</strong> — {contact.email}
          </span>
          <button
            type="button"
            onClick={() => dispatch({ type: 'removeContact', payload: contact.id })}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}

export default ContactList
