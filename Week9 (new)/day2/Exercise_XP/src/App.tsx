import Greeting from './components/Greeting'
import Counter from './components/Counter'
import UserCard from './components/UserCard'
import UserList from './components/UserList'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>React + TypeScript Exercises</h1>

      <section>
        <h2 className="section-title">Exercise 2 — Greeting</h2>
        <Greeting name="Ariel" messageCount={3} />
      </section>

      <section>
        <h2 className="section-title">Exercise 3 — Counter</h2>
        <Counter />
      </section>

      <section>
        <h2 className="section-title">Exercise 4 — UserCard (optional props)</h2>
        <div className="user-card-grid">
          <UserCard name="Dana Cohen" age={29} role="Developer" />
          <UserCard name="Sam" />
          <UserCard />
        </div>
      </section>

      <section>
        <h2 className="section-title">Exercise 5 — UserList (fetched from API)</h2>
        <UserList />
      </section>
    </div>
  )
}

export default App
