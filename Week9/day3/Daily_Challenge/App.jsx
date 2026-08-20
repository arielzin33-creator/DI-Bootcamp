import Calendar from './components/Calendar';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__eyebrow">redux toolkit · daily planner</p>
        <h1 className="masthead__title">Planner</h1>
      </header>

      <div className="layout">
        <Calendar />
        <div className="day-panel">
          <AddTask />
          <TaskList />
        </div>
      </div>
    </div>
  );
}
