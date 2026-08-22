import AddTodo from './components/AddTodo'
import TodoList from './components/TodoList'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>Todo List with Filters</h1>
      <AddTodo />
      <TodoList />
    </div>
  )
}

export default App
