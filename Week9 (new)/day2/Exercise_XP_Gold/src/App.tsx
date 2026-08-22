import RegistrationForm from './components/RegistrationForm'
import PeopleTableDemo from './components/PeopleTableDemo'
import UserList from './components/UserList'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>React + TypeScript Exercises (Gold)</h1>

      <section>
        <h2 className="section-title">Exercise 1 — useForm custom hook</h2>
        <RegistrationForm />
      </section>

      <section>
        <h2 className="section-title">Exercise 2 — Generic DataTable</h2>
        <PeopleTableDemo />
      </section>

      <section>
        <h2 className="section-title">Exercise 3 — useDataFetching (caching)</h2>
        <UserList />
      </section>
    </div>
  )
}

export default App
