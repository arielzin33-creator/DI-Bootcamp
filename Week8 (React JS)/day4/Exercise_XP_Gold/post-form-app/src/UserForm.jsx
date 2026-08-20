import React from "react";

const API_URL = "https://jsonplaceholder.typicode.com/users/";

/**
 * UserForm
 *
 * A class component holding "user" and "email" in state. Both inputs
 * are controlled: their value comes from state, and onChange updates
 * that same state, so state is always the single source of truth for
 * what's in the form (per the exercise's "use state to hold data").
 *
 * On submit, the current state is read and POSTed as JSON to
 * jsonplaceholder's fake API, and the response is logged.
 */
class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      email: "",
    };
  }

  handleUserChange = (event) => {
    this.setState({ user: event.target.value });
  };

  handleEmailChange = (event) => {
    this.setState({ email: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { user, email } = this.state;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user, email }),
    });

    const data = await response.json();
    console.log(data);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit} style={styles.form}>
        <label style={styles.label}>
          User
          <input
            type="text"
            value={this.state.user}
            onChange={this.handleUserChange}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Email
          <input
            type="email"
            value={this.state.email}
            onChange={this.handleEmailChange}
            style={styles.input}
          />
        </label>

        <button type="submit" style={styles.button}>
          Submit
        </button>
      </form>
    );
  }
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "280px",
    fontFamily: "sans-serif",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
  },
  input: {
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #1e1e1e",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
};

export default UserForm;
