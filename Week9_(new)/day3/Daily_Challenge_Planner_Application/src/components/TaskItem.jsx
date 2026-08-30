import { useState } from 'react'
import EditTask from './EditTask'
import DeleteTask from './DeleteTask'

function TaskItem({ task }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <li className="task-item">
        <EditTask id={task.id} text={task.text} onDone={() => setIsEditing(false)} />
      </li>
    )
  }

  return (
    <li className="task-item">
      <span>{task.text}</span>
      <div className="task-item-actions">
        <button type="button" onClick={() => setIsEditing(true)}>
          Edit
        </button>
        <DeleteTask id={task.id} />
      </div>
    </li>
  )
}

export default TaskItem
