import AddTodoForm from './components/AddTodoForm';
import VisibilityFilterTabs from './components/VisibilityFilterTabs';
import TodoList from './components/TodoList';

export default function App() {
  return (
    <div className="page">
      <div className="board">
        <header className="board__head">
          <h1 className="board__title">room 4B — today</h1>
          <p className="board__lede">redux · createSelector · useCallback</p>
        </header>

        <VisibilityFilterTabs />
        <AddTodoForm />
        <TodoList />
      </div>
    </div>
  );
}
