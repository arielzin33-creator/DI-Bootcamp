import Greeting from './components/Greeting';
import Counter from './components/Counter';
import UserCard from './components/UserCard';
import UserList from './components/UserList';
import RegistrationForm from './components/RegistrationForm';
import DataTableDemo from './components/DataTableDemo';
import CachedUserList from './components/CachedUserList';
import './App.css';

function App() {
  return (
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
    </main>
  );
}

export default App;
