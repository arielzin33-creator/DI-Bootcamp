import { useSelector } from 'react-redux';
import { selectTodos } from '../features/todos/selectors';
import TodoItem from './TodoItem';

export default function TodoList() {
  const todos = useSelector(selectTodos);

  if (todos.length === 0) {
    return <p className="notebook__empty">Nothing on the page yet.</p>;
  }

  return (
    <ul className="notebook__lines">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
