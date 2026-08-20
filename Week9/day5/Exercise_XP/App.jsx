import GenreFilter from './components/GenreFilter';
import BookList from './components/BookList';
import SelectorInspector from './components/SelectorInspector';

export default function App() {
  return (
    <div className="shell">
      <header className="masthead">
        <p className="masthead__eyebrow">Redux · createSelector</p>
        <h1 className="masthead__title">Book inventory</h1>
        <p className="masthead__lede">
          One store, one array of records, four memoised views onto it. Pick a genre and the
          catalogue below is rebuilt from a cached slice rather than a fresh pass over the data.
        </p>
      </header>

      <GenreFilter />

      <main className="layout">
        <BookList />
        <SelectorInspector />
      </main>
    </div>
  );
}
