import { ContactProvider } from './context/ContactContext'
import ProfileManager from './components/ProfileManager'
import SurveyFeedback from './components/SurveyFeedback'
import ContactForm from './components/ContactForm'
import AddContactForm from './components/AddContactForm'
import ContactList from './components/ContactList'
import FocusInput from './components/FocusInput'
import './App.css'

function App() {
  return (
    <ContactProvider>
      <div className="app">
        <h1>React + TypeScript Exercises (Ninja)</h1>

        <section>
          <h2 className="section-title">Exercise 1 — Profile useReducer</h2>
          <ProfileManager />
        </section>

        <section>
          <h2 className="section-title">Exercise 2 — Survey Feedback useReducer</h2>
          <SurveyFeedback />
        </section>

        <section>
          <h2 className="section-title">Exercise 3 — Contact Form useReducer</h2>
          <ContactForm />
        </section>

        <section>
          <h2 className="section-title">Exercise 4 — Contacts via useContext</h2>
          <AddContactForm />
          <ContactList />
        </section>

        <section>
          <h2 className="section-title">Exercise 5 — useRef Focus</h2>
          <FocusInput />
        </section>
      </div>
    </ContactProvider>
  )
}

export default App
