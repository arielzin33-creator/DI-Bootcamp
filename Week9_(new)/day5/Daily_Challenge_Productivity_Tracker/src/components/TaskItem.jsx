import { memo, useRef, useState } from 'react'

// Wrapped in memo() with stable handlers passed down from TaskList (see its
// useCallback usage), so a task only re-renders when its own data changes —
// not just because a sibling task or the selected category changed.
function TaskItem({ task, onToggle, onDelete, onEdit, onProgressChange }) {
  const renderCount = useRef(0)
  renderCount.current += 1

  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)

  const handleSaveEdit = (event) => {
    event.preventDefault()
    const trimmed = draftTitle.trim()
    if (trimmed) {
      onEdit(task.id, trimmed)
    }
    setIsEditing(false)
  }

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-item-main">
        <input
          type="checkbox"
          checked={task.completed}
          data-id={task.id}
          onChange={onToggle}
          title="Mark complete/incomplete"
        />

        {isEditing ? (
          <form className="task-edit-form" onSubmit={handleSaveEdit}>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              autoFocus
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <span className="task-title">{task.title}</span>
        )}

        <span className="render-count">renders: {renderCount.current}</span>
      </div>

      <div className="task-item-controls">
        <input
          type="range"
          min="0"
          max="100"
          step="10"
          value={task.progress}
          data-id={task.id}
          onChange={onProgressChange}
        />
        <span className="progress-label">{task.progress}%</span>

        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
        <button type="button" data-id={task.id} onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  )
}

export default memo(TaskItem)
