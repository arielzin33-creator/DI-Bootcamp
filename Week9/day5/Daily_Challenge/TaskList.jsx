import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSelectedCategoryId } from '../features/categories/selectors';
import { makeSelectTasksByCategory } from '../features/tasks/selectors';
import { taskCompletedToggled, taskDeleted, taskEdited, taskProgressUpdated } from '../features/tasks/tasksSlice';
import TaskItem from './TaskItem';

export default function TaskList() {
  const dispatch = useDispatch();
  const selectedCategoryId = useSelector(selectSelectedCategoryId);

  // One selector instance per mounted TaskList, so its cache is only ever
  // asked about the one category this list currently cares about — see the
  // comment on `makeSelectTasksByCategory` in features/tasks/selectors.js.
  const selectTasksByCategory = useMemo(makeSelectTasksByCategory, []);
  const tasks = useSelector((state) => selectTasksByCategory(state, selectedCategoryId));

  // Each handler is created once and kept stable across renders (as long as
  // `dispatch` doesn't change, which react-redux guarantees it won't). That
  // stability is what lets `memo(TaskItem)` actually skip re-rendering rows
  // whose own task object didn't change — without `useCallback` here, every
  // TaskList render would hand every TaskItem a brand-new function prop and
  // the memo comparison would fail every time, regardless of the `task` prop.
  const handleToggleComplete = useCallback(
    (id) => dispatch(taskCompletedToggled(id)),
    [dispatch],
  );
  const handleProgressChange = useCallback(
    (id, progress) => dispatch(taskProgressUpdated({ id, progress })),
    [dispatch],
  );
  const handleDelete = useCallback((id) => dispatch(taskDeleted(id)), [dispatch]);
  const handleEditSave = useCallback(
    (id, changes) => dispatch(taskEdited({ id, changes })),
    [dispatch],
  );

  if (tasks.length === 0) {
    return (
      <section className="tasks">
        <p className="tasks__empty">Nothing logged in this category yet.</p>
      </section>
    );
  }

  return (
    <section className="tasks">
      <ul className="tasks__list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onProgressChange={handleProgressChange}
            onDelete={handleDelete}
            onEditSave={handleEditSave}
          />
        ))}
      </ul>
    </section>
  );
}
