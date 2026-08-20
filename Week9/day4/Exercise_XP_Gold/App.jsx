import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__eyebrow">redux thunk · async todo list</p>
        <h1 className="masthead__title">Shipping Desk</h1>
        <p className="masthead__lede">
          Line items come from two places — added locally, or pulled in by a thunk that fetches
          from the mock API. Both live in the same list; only the fetched ones get replaced on
          refresh.
        </p>
      </header>

      <AddTodo />
      <TodoList />
    </div>
  );
}
