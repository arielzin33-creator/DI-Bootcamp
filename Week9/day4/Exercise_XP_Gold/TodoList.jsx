import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTodoItems, selectTodosStatus, selectTodosError, selectTodoStats } from '../features/todos/selectors';
import { fetchTodos } from '../features/todos/thunks';
import ToggleTodo from './ToggleTodo';
import RemoveTodo from './RemoveTodo';

export default function TodoList() {
  const dispatch = useDispatch();
  const items = useSelector(selectTodoItems);
  const status = useSelector(selectTodosStatus);
  const error = useSelector(selectTodosError);
  const stats = useSelector(selectTodoStats);

  const handleFetch = useCallback(() => dispatch(fetchTodos()), [dispatch]);

  // Fetch once on mount. `handleFetch` is stable (see above), so this
  // effect really does run only once, not on every render.
  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <section className="manifest" aria-label="Todo list">
      <div className="manifest__clip" aria-hidden="true" />

      <div className="manifest__paper">
        <header className="manifest__head">
          <h2 className="manifest__title">Manifest</h2>
          <span
            className={`manifest__stamp manifest__stamp--${status}`}
            aria-live="polite"
          >
            {status === 'loading' && 'IN TRANSIT'}
            {status === 'succeeded' && 'ALL CLEAR'}
            {status === 'failed' && 'DELIVERY FAILED'}
            {status === 'idle' && 'PENDING'}
          </span>
        </header>

        {status === 'failed' && (
          <p className="manifest__error" role="alert">
            {error}{' '}
            <button type="button" className="manifest__retry" onClick={handleFetch}>
              Retry
            </button>
          </p>
        )}

        {items.length === 0 ? (
          <p className="manifest__empty">
            {status === 'loading' ? 'Loading the manifest…' : 'No line items yet.'}
          </p>
        ) : (
          <ul className="manifest__lines">
            {items.map((todo) => (
              <li key={todo.id} className={`line${todo.completed ? ' line--done' : ''}`}>
                <ToggleTodo todo={todo} />
                <span className="line__text">{todo.title}</span>
                <RemoveTodo todoId={todo.id} label={todo.title} />
              </li>
            ))}
          </ul>
        )}

        <footer className="manifest__footer">
          <span>{stats.total} line items</span>
          <span>{stats.completed} cleared</span>
          <button type="button" className="manifest__refresh" onClick={handleFetch}>
            Refresh from source
          </button>
        </footer>
      </div>
    </section>
  );
}
