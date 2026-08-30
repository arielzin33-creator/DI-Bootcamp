import { useSelector } from 'react-redux'
import TaskItem from './TaskItem'

function TaskList() {
  const selectedDate = useSelector((state) => state.planner.selectedDate)
  const tasks = useSelector((state) => state.planner.tasksByDay[state.planner.selectedDate] ?? [])

  if (tasks.length === 0) {
    return <p className="empty-message">No tasks for {selectedDate}. Add one above.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export default TaskList
