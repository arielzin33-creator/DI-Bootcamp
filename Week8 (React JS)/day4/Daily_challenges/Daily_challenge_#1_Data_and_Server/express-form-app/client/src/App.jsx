import React from "react";

/**
 * App
 *
 * Part I: on mount, fetches /api/hello and displays the message as a
 * header.
 * Part II: a form posts whatever's typed to /api/world, and the
 * server's reply is shown right below the input.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      helloMessage: "",
      inputValue: "",
      responseMessage: "",
    };
  }

  async componentDidMount() {
    const response = await fetch("/api/hello");
    const data = await response.json();
    this.setState({ helloMessage: data.message });
  }

  handleChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch("/api/world", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post: this.state.inputValue }),
    });

    const data = await response.json();
    this.setState({ responseMessage: data.message });
  };

  render() {
    const { helloMessage, inputValue, responseMessage } = this.state;

    return (
      <div style={styles.page}>
        <h1 style={styles.heading}>{helloMessage}</h1>

        <form onSubmit={this.handleSubmit} style={styles.form}>
          <label style={styles.label}>Post to Server:</label>
          <div style={styles.inputRow}>
            <input
              type="text"
              value={inputValue}
              onChange={this.handleChange}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Submit
            </button>
          </div>
        </form>

        {responseMessage && <p style={styles.response}>{responseMessage}</p>}
      </div>
    );
  }
}

const styles = {
  page: {
    textAlign: "center",
    fontFamily: "sans-serif",
    paddingTop: "40px",
  },
  heading: {
    fontSize: "20px",
    marginBottom: "40px",
  },
  form: {
    display: "inline-block",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
  },
  input: {
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "2px solid #4a90d9",
    outline: "none",
  },
  button: {
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  },
  response: {
    marginTop: "20px",
  },
};

export default App;
