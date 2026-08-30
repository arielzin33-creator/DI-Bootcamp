import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCompletedTasks } from './features/selectors'
import CategorySelector from './components/CategorySelector'
import TaskList from './components/TaskList'
import './App.css'

function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('work')
  const completedCount = useSelector(selectCompletedTasks)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Productivity Tracker</h1>
        <span className="completed-badge">{completedCount} completed overall</span>
      </header>

      <CategorySelector selectedCategoryId={selectedCategoryId} onSelect={setSelectedCategoryId} />
      <TaskList categoryId={selectedCategoryId} />
    </div>
  )
}

export default App
