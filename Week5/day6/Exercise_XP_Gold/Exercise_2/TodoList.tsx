// src/TodoList.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTodo, deleteTodo } from './features/todoSlice';
import { selectFilteredTodos, isOverdue } from './features/selectors';

const TodoList: React.FC = () => {
  const todos = useSelector(selectFilteredTodos);
  const dispatch = useDispatch();

  if (todos.length === 0) {
    return <p style={{ textAlign: 'center' }}>No todos to show.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, maxWidth: '450px', margin: '20px auto' }}>
      {todos.map(todo => {
        const overdue = isOverdue(todo);

        return (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #ddd',
              backgroundColor: overdue ? '#ffe5e5' : 'transparent'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => dispatch(toggleTodo(todo.id))}
              />
              <span
                style={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#999' : '#000'
                }}
              >
                {todo.title}
              </span>
              {todo.dueDate && (
                <small style={{ color: overdue ? '#c0392b' : '#666', marginLeft: '6px' }}>
                  (Due: {todo.dueDate}{overdue ? ' — Overdue!' : ''})
                </small>
              )}
            </label>

            <button onClick={() => dispatch(deleteTodo(todo.id))}>Delete</button>
          </li>
        );
      })}
    </ul>
  );
};

export default TodoList;