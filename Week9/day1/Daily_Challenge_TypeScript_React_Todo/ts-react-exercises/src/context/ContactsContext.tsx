/**
 * Exercise (Set 3) 4: Using useContext for Global State Management
 *
 * This demonstrates:
 * - ContactsContext created as createContext<ContactsContextValue | undefined>(undefined) —
 *   `undefined` is the "no provider above this component" case, which useContacts()
 *   below turns into a helpful thrown error instead of a silent undefined.
 * - A reducer (contactsReducer) driving state, exposed through context so any
 *   nested component can read state and dispatch without props being threaded
 *   down through every intermediate component ("prop drilling").
 */

import { createContext, useContext, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';

export interface Contact {
  id: string;
  name: string;
  email: string;
}

export interface ContactsState {
  contacts: Contact[];
}

export type ContactsAction =
  | { type: 'addContact'; payload: Contact }
  | { type: 'removeContact'; payload: { id: string } };

const initialContactsState: ContactsState = { contacts: [] };

function contactsReducer(state: ContactsState, action: ContactsAction): ContactsState {
  switch (action.type) {
    case 'addContact':
      return { contacts: [...state.contacts, action.payload] };
    case 'removeContact':
      return {
        contacts: state.contacts.filter((contact) => contact.id !== action.payload.id),
      };
    default:
      return state;
  }
}

interface ContactsContextValue {
  state: ContactsState;
  dispatch: Dispatch<ContactsAction>;
}

const ContactsContext = createContext<ContactsContextValue | undefined>(undefined);

interface ContactsProviderProps {
  children: ReactNode;
}

export function ContactsProvider({ children }: ContactsProviderProps) {
  const [state, dispatch] = useReducer(contactsReducer, initialContactsState);

  return (
    <ContactsContext.Provider value={{ state, dispatch }}>{children}</ContactsContext.Provider>
  );
}

export function useContacts(): ContactsContextValue {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
