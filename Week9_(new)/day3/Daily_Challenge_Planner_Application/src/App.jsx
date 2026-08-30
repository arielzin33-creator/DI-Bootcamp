import Calendar from './components/Calendar'
import AddTask from './components/AddTask'
import TaskList from './components/TaskList'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>Daily Planner</h1>
      <Calendar />
      <AddTask />
      <TaskList />
    </div>
  )
}

export default App
