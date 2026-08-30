import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addTask,
  editTask,
  deleteTask,
  updateTaskProgress,
  toggleTaskCompletion,
} from '../features/tasks/tasksSlice'
import { selectTasksByCategory, selectCategoryById } from '../features/selectors'
import TaskItem from './TaskItem'

function TaskList({ categoryId }) {
  const dispatch = useDispatch()
  const tasks = useSelector((state) => selectTasksByCategory(state, categoryId))
  const category = useSelector((state) => selectCategoryById(state, categoryId))
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // Stable handlers shared by every TaskItem: each reads the relevant
  // task's id off the DOM event instead of being re-created per task, so
  // TaskItem's memo() can actually bail out unaffected items.
  const handleToggle = useCallback(
    (event) => {
      dispatch(toggleTaskCompletion(event.currentTarget.dataset.id))
    },
    [dispatch]
  )

  const handleDelete = useCallback(
    (event) => {
      dispatch(deleteTask(event.currentTarget.dataset.id))
    },
    [dispatch]
  )

  const handleProgressChange = useCallback(
    (event) => {
      dispatch(
        updateTaskProgress({
          id: event.currentTarget.dataset.id,
          progress: Number(event.target.value),
        })
      )
    },
    [dispatch]
  )

  const handleEdit = useCallback(
    (id, title) => {
      dispatch(editTask({ id, title }))
    },
    [dispatch]
  )

  const handleAddTask = (event) => {
    event.preventDefault()
    const trimmed = newTaskTitle.trim()
    if (!trimmed || !categoryId) return

    dispatch(addTask(trimmed, categoryId))
    setNewTaskTitle('')
  }

  if (!categoryId) {
    return <p className="empty-message">No category selected.</p>
  }

  return (
    <div className="task-list-container">
      <h2>{category ? category.name : 'Unknown category'} tasks</h2>

      <form className="add-task" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Add a task…"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <p className="empty-message">No tasks in this category yet.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onProgressChange={handleProgressChange}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default TaskList
