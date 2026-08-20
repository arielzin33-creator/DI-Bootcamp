import UserData from './components/UserData';

export default function App() {
  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__eyebrow">redux thunk · async lifecycle</p>
        <h1 className="masthead__title">Front Desk</h1>
        <p className="masthead__lede">
          Each lookup dispatches a hand-written thunk that fetches a record, then dispatches a
          success or failure action depending on what came back.
        </p>
      </header>

      <UserData />
    </div>
  );
}
