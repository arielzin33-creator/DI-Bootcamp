import AgeDisplay from './components/AgeDisplay';
import AgeControls from './components/AgeControls';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__eyebrow">redux toolkit · createAsyncThunk</p>
        <h1 className="masthead__title">Age Tracker</h1>
      </header>

      <AgeDisplay />
      <AgeControls />
    </div>
  );
}
