import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'

export interface Contact {
  id: number
  name: string
  email: string
}

export interface ContactState {
  contacts: Contact[]
}

export type ContactAction =
  | { type: 'addContact'; payload: Contact }
  | { type: 'removeContact'; payload: number }

interface ContactContextValue {
  state: ContactState
  dispatch: Dispatch<ContactAction>
}

const initialState: ContactState = { contacts: [] }

function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case 'addContact':
      return { contacts: [...state.contacts, action.payload] }
    case 'removeContact':
      return { contacts: state.contacts.filter((contact) => contact.id !== action.payload) }
    default:
      return state
  }
}

const ContactContext = createContext<ContactContextValue | undefined>(undefined)

export function ContactProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contactReducer, initialState)

  return (
    <ContactContext.Provider value={{ state, dispatch }}>{children}</ContactContext.Provider>
  )
}

export function useContacts(): ContactContextValue {
  const context = useContext(ContactContext)
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider')
  }
  return context
}
