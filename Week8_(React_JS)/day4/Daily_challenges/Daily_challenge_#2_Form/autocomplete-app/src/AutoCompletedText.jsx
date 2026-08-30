import React from "react";
import rawCountries from "./Countries.js";

// Countries.js is a single string, split on newlines. The template
// literal starts with a newline right after the opening backtick, so
// the first element after splitting is an empty string — filtered
// out here rather than in the data file itself.
const countries = rawCountries.filter(Boolean);

/**
 * AutoCompletedText
 *
 * Filters the imported countries list as the user types, shows the
 * matches as a clickable list, and fills the input with whichever
 * one is clicked while clearing the suggestion list.
 */
class AutoCompletedText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      text: "",
    };
  }

  handleChange = (event) => {
    const userInput = event.target.value;

    const filteredSuggestions = userInput
      ? countries.filter((country) =>
          country.toLowerCase().startsWith(userInput.toLowerCase())
        )
      : [];

    this.setState({
      text: userInput,
      suggestions: filteredSuggestions,
    });
  };

  handleSelect = (country) => {
    this.setState({
      text: country,
      suggestions: [],
    });
  };

  render() {
    const { suggestions, text } = this.state;

    return (
      <div style={styles.card}>
        <h2 style={styles.heading}>Auto Completed</h2>

        <input
          type="text"
          value={text}
          onChange={this.handleChange}
          style={styles.input}
        />

        {suggestions.length > 0 && (
          <ul style={styles.list}>
            {suggestions.map((country) => (
              <li
                key={country}
                onClick={() => this.handleSelect(country)}
                style={styles.listItem}
              >
                {country}
              </li>
            ))}
          </ul>
        )}

        <div style={styles.footer}>Suggestions: {suggestions.length}</div>
      </div>
    );
  }
}

const styles = {
  card: {
    maxWidth: "380px",
    margin: "40px auto",
    padding: "24px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontFamily: "sans-serif",
  },
  heading: {
    textAlign: "center",
    fontSize: "22px",
    marginTop: 0,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "2px solid #1e1e1e",
    outline: "none",
    marginBottom: "12px",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    maxHeight: "260px",
    overflowY: "auto",
  },
  listItem: {
    padding: "12px 16px",
    marginBottom: "4px",
    backgroundColor: "#e8e8e8",
    borderLeft: "6px solid #f5c518",
    textAlign: "center",
    cursor: "pointer",
  },
  footer: {
    marginTop: "12px",
    padding: "10px",
    backgroundColor: "#f5c518",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default AutoCompletedText;
