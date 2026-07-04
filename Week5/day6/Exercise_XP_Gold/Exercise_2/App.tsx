// src/App.tsx
import React from 'react';
import AddTodo from './AddTodo';
import TodoFilters from './TodoFilters';
import TodoList from './TodoList';

function App() {
  return (
    <div className="App" style={{ marginTop: '50px' }}>
      <h1 style={{ textAlign: 'center' }}>Todo List</h1>
      <AddTodo />
      <TodoFilters />
      <TodoList />
    </div>
  );
}

export default App;