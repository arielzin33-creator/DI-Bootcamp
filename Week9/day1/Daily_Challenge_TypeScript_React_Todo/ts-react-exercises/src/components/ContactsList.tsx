import { useContacts } from '../context/ContactsContext';
import AddContactForm from './AddContactForm';

function ContactsList() {
  const { state, dispatch } = useContacts();

  return (
    <div className="card">
      <AddContactForm />

      {state.contacts.length === 0 ? (
        <p className="muted">No contacts yet — add one above.</p>
      ) : (
        <ul className="user-list">
          {state.contacts.map((contact) => (
            <li key={contact.id}>
              <strong>{contact.name}</strong> — {contact.email}{' '}
              <button
                type="button"
                className="link-button"
                onClick={() =>
                  dispatch({ type: 'removeContact', payload: { id: contact.id } })
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContactsList;
