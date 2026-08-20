import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTodos, selectVisibilityFilter, selectFilteredTodosCount } from '../features/todos/selectors';
import { todoToggled, todoRemoved } from '../features/todos/todosSlice';
import TodoItem from './TodoItem';

export default function TodoList() {
  const dispatch = useDispatch();
  const todos = useSelector(selectTodos);
  const visibilityFilter = useSelector(selectVisibilityFilter);
  const filteredCount = useSelector(selectFilteredTodosCount);

  // Built once and kept stable across renders (as long as `dispatch` is
  // stable, which react-redux guarantees). `memo(TodoItem)` only skips a
  // re-render when every prop it receives is reference-equal to last time —
  // an inline `onClick={() => dispatch(todoToggled(todo.id))}` written per
  // row inside the `.map()` below would hand every row a new function on
  // every TodoList render, and the memo comparison would fail regardless of
  // whether that row's own todo changed.
  const handleToggle = useCallback((id) => dispatch(todoToggled(id)), [dispatch]);
  const handleDelete = useCallback((id) => dispatch(todoRemoved(id)), [dispatch]);

  return (
    <section className="board__todos" aria-label="Todo list">
      {todos.length === 0 ? (
        <p className="board__empty">
          {visibilityFilter === 'All'
            ? 'Nothing on the list yet.'
            : `No ${visibilityFilter.toLowerCase()} items.`}
        </p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      <p className="board__count">
        {filteredCount} {filteredCount === 1 ? 'item' : 'items'}
        {visibilityFilter !== 'All' && ` — ${visibilityFilter.toLowerCase()}`}
      </p>
    </section>
  );
}
