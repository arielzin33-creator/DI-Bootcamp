import React from "react";

/**
 * App
 *
 * Fetches the user list from the Express backend on mount and stores
 * it in state. The request goes to the relative path "/users" (not a
 * full http://localhost:3001/... URL) — that relative path is what
 * lets the dev-server proxy step in and forward it to Express,
 * exactly like CRA's package.json "proxy" key would.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    fetch("/users")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ users: data });
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
      });
  }

  render() {
    const { users } = this.state;

    return (
      <div style={styles.container}>
        <h2>Users</h2>
        <ul style={styles.list}>
          {users.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </div>
    );
  }
}

const styles = {
  container: {
    padding: "24px",
    fontFamily: "sans-serif",
    textAlign: "center",
  },
  list: {
    listStylePosition: "inside",
    padding: 0,
  },
};

export default App;
