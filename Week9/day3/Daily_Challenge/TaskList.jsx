import { useSelector } from 'react-redux';
import { selectSelectedDate, selectTasksForSelectedDate } from '../features/planner/selectors';
import { formatDayHeading } from '../features/planner/dateUtils';
import EditTask from './EditTask';
import DeleteTask from './DeleteTask';

export default function TaskList() {
  const selectedDate = useSelector(selectSelectedDate);
  const tasks = useSelector(selectTasksForSelectedDate);

  return (
    <section className="tasks" aria-label="Tasks for the selected day">
      <h2 className="tasks__heading">{formatDayHeading(selectedDate)}</h2>

      {tasks.length === 0 ? (
        <p className="tasks__empty">Nothing planned for this day yet.</p>
      ) : (
        <ul className="tasks__list">
          {tasks.map((task) => (
            <li key={task.id} className="task">
              <EditTask date={selectedDate} task={task} />
              <DeleteTask date={selectedDate} taskId={task.id} label={task.text} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
