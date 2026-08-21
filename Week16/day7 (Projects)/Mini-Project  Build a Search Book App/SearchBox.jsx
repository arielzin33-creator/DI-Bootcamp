// The search form: a text input, a submit button, and a Newest/Oldest sort toggle.
// This component is presentational — Book owns the state and the actual filtering
// function, passed down as props.

function SearchBox({ query, onQueryChange, onSubmit, sortOrder, onSortChange }) {
  return (
    <form className="search-box" onSubmit={onSubmit}>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search books (e.g. Harry Potter)"
        aria-label="Search books"
      />
      <select
        value={sortOrder}
        onChange={(event) => onSortChange(event.target.value)}
        aria-label="Sort order"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBox;
