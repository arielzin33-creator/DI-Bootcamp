import AuthGate from './components/AuthGate';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__eyebrow">redux toolkit · authentication</p>
        <h1 className="masthead__title">The Vestibule</h1>
      </header>

      <AuthGate />
    </div>
  );
}
