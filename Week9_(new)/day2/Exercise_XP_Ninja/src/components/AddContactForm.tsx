import { useState, type FormEvent } from 'react'
import { useContacts } from '../context/ContactContext'

function AddContactForm() {
  const { dispatch } = useContacts()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (!name.trim() || !email.trim()) return

    dispatch({ type: 'addContact', payload: { id: Date.now(), name, email } })
    setName('')
    setEmail('')
  }

  return (
    <form className="add-contact-form" onSubmit={handleSubmit}>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Add Contact</button>
    </form>
  )
}

export default AddContactForm
