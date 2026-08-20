import CategorySelector from './components/CategorySelector';
import ProgressSummary from './components/ProgressSummary';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';

export default function App() {
  return (
    <div className="shell">
      <header className="masthead">
        <p className="masthead__eyebrow">redux · createSelector · useCallback</p>
        <h1 className="masthead__title">productivity_tracker</h1>
        <p className="masthead__lede">
          Tasks and categories live in two slices. Every derived view — by category, by
          completion — is a memoised selector; the row list only re-renders the row that changed.
        </p>
      </header>

      <ProgressSummary />
      <CategorySelector />
      <AddTaskForm />
      <TaskList />
    </div>
  );
}
