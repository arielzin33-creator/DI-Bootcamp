import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';

export default function App() {
  return (
    <div className="page">
      <div className="notebook">
        <div className="notebook__holes" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="notebook__hole" />
          ))}
        </div>

        <div className="notebook__page">
          <header className="notebook__head">
            <p className="notebook__eyebrow">redux toolkit basics</p>
            <h1 className="notebook__title">To-do</h1>
          </header>

          <AddTodo />
          <TodoList />
        </div>
      </div>
    </div>
  );
}
