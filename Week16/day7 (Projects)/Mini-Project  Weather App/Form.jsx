// The form: two inputs (city, country) and a button that triggers the fetch.
//
// Uncontrolled inputs here — the values are read off the form on submit via `name`,
// which is all this app needs. The parent class component owns the *results* in state,
// which is what the brief asks for.

function Form({ getWeather, loading }) {
  return (
    <form onSubmit={getWeather}>
      <input type="text" name="city" placeholder="City..." />
      <input type="text" name="country" placeholder="Country..." />
      <button className="form-button" disabled={loading}>
        {loading ? 'loading...' : 'get Weather'}
      </button>
    </form>
  );
}

export default Form;
