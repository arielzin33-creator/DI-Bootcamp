import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addTodo } from '../features/todos/todosSlice'

function AddTodo() {
  const [text, setText] = useState('')
  const dispatch = useDispatch()

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    dispatch(addTodo(trimmed))
    setText('')
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add Todo</button>
    </form>
  )
}

export default AddTodo
