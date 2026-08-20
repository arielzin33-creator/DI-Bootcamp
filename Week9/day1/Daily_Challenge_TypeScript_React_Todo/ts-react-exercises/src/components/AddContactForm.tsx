import { useState } from 'react';
import { useContacts } from '../context/ContactsContext';

function AddContactForm() {
  const { dispatch } = useContacts();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const handleAdd = (): void => {
    if (!name.trim() || !email.trim()) return;

    dispatch({
      type: 'addContact',
      payload: { id: crypto.randomUUID(), name, email },
    });
    setName('');
    setEmail('');
  };

  return (
    <div className="form-field-row">
      <div className="form-field">
        <label htmlFor="new-contact-name">Name</label>
        <input
          id="new-contact-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="new-contact-email">Email</label>
        <input
          id="new-contact-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <button type="button" onClick={handleAdd}>
        Add contact
      </button>
    </div>
  );
}

export default AddContactForm;
