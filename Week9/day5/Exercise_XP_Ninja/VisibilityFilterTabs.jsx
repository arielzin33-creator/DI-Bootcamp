import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VISIBILITY_FILTERS, visibilityFilterChanged } from '../features/todos/todosSlice';
import { selectVisibilityFilter, selectTodoStats } from '../features/todos/selectors';

const TABS = [VISIBILITY_FILTERS.ALL, VISIBILITY_FILTERS.ACTIVE, VISIBILITY_FILTERS.COMPLETED];

export default function VisibilityFilterTabs() {
  const dispatch = useDispatch();
  const activeFilter = useSelector(selectVisibilityFilter);
  const stats = useSelector(selectTodoStats);

  const handleSelect = useCallback(
    (filter) => dispatch(visibilityFilterChanged(filter)),
    [dispatch],
  );

  return (
    <nav className="tabs" aria-label="Filter todos by status">
      {TABS.map((filter) => (
        <button
          key={filter}
          type="button"
          className="tabs__tab"
          aria-pressed={filter === activeFilter}
          onClick={() => handleSelect(filter)}
        >
          {filter}
        </button>
      ))}
      <span className="tabs__left">{stats.active} left</span>
    </nav>
  );
}
