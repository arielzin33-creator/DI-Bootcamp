import { useDispatch } from 'react-redux';
import { toggleTodo, removeTodo } from '../features/todos/todosSlice';

export default function TodoItem({ todo }) {
  const dispatch = useDispatch();

  return (
    <li className={`todo${todo.completed ? ' todo--done' : ''}`}>
      <button
        type="button"
        className="todo__check"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
        onClick={() => dispatch(toggleTodo(todo.id))}
      >
        {todo.completed && <span className="todo__tick" aria-hidden="true" />}
      </button>

      <span className="todo__text">{todo.text}</span>

      <button
        type="button"
        className="todo__remove"
        aria-label={`Remove "${todo.text}"`}
        onClick={() => dispatch(removeTodo(todo.id))}
      >
        ×
      </button>
    </li>
  );
}
