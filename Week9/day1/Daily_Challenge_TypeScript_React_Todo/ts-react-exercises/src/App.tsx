import Greeting from './components/Greeting';
import Counter from './components/Counter';
import UserCard from './components/UserCard';
import UserList from './components/UserList';
import RegistrationForm from './components/RegistrationForm';
import DataTableDemo from './components/DataTableDemo';
import CachedUserList from './components/CachedUserList';
import ProfileManager from './components/ProfileManager';
import SurveyFeedback from './components/SurveyFeedback';
import ContactForm from './components/ContactForm';
import ContactsList from './components/ContactsList';
import FocusableInput from './components/FocusableInput';
import BookApp from './components/BookApp';
import { ContactsProvider } from './context/ContactsContext';
import './App.css';

function App() {
  return (
    <ContactsProvider>
      <main className="exercises">
        <h1>TypeScript + React Exercises</h1>

      <section>
        <h2 className="section-title">Exercise 2 — Greeting (typed props)</h2>
        <Greeting name="Ada" messageCount={3} />
        <Greeting name="Grace" messageCount={1} />
      </section>

      <section>
        <h2 className="section-title">Exercise 3 — Counter (typed useState)</h2>
        <Counter />
      </section>

      <section>
        <h2 className="section-title">
          Exercise 4 — UserCard (optional props)
        </h2>
        <div className="card-row">
          <UserCard name="Marco" age={29} role="Developer" />
          <UserCard name="Lina" />
          <UserCard />
        </div>
      </section>

      <section>
        <h2 className="section-title">
          Exercise 5 — UserList (useEffect + fetch)
        </h2>
        <UserList />
      </section>

      <h1 className="set-divider">Exercise Set 2</h1>

      <section>
        <h2 className="section-title">
          Set 2, Exercise 1 — Registration form (useForm hook)
        </h2>
        <RegistrationForm />
      </section>

      <section>
        <h2 className="section-title">
          Set 2, Exercise 2 — Generic DataTable (sorting + selection)
        </h2>
        <DataTableDemo />
      </section>

      <section>
        <h2 className="section-title">
          Set 2, Exercise 3 — Data fetching &amp; caching (useDataFetching hook)
        </h2>
        <CachedUserList />
      </section>

      <h1 className="set-divider">Exercise Set 3</h1>

      <section>
        <h2 className="section-title">
          Set 3, Exercise 1 — Profile update (useReducer, discriminated union)
        </h2>
        <ProfileManager />
      </section>

      <section>
        <h2 className="section-title">
          Set 3, Exercise 2 — Survey feedback (useReducer state machine)
        </h2>
        <SurveyFeedback />
      </section>

      <section>
        <h2 className="section-title">
          Set 3, Exercise 3 — Contact form (useReducer for field state)
        </h2>
        <ContactForm />
      </section>

      <section>
        <h2 className="section-title">
          Set 3, Exercise 4 — Global contacts list (useContext, no prop drilling)
        </h2>
        <ContactsList />
      </section>

      <section>
        <h2 className="section-title">
          Set 3, Exercise 5 — Focus management (useRef)
        </h2>
        <FocusableInput />
      </section>

      <h1 className="set-divider">Daily Challenge</h1>

      <section>
        <h2 className="section-title">
          Book list — generic List component + useState
        </h2>
        <BookApp />
      </section>
      </main>
    </ContactsProvider>
  );
}

export default App;
