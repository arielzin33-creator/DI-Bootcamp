import React from "react";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

/**
 * UsersList
 *
 * Progression across the exercise:
 *  - Part II: state held `users` (array) and `isLoaded` (boolean,
 *    starts false). While not loaded, rendered a "Loading..." div;
 *    once loaded, rendered a bulleted <ul>/<li> list of
 *    "Name: ... | Email: ...", each <li> keyed by user id.
 *  - Part III: this final version, matching the provided screenshot —
 *    the bulleted list is replaced with centered blocks showing ID,
 *    Name, Username, Email, and City (pulled from the nested
 *    `address.city` field), under a "List of users:" heading. Each
 *    block keeps a key, now on the wrapping <div> rather than an
 *    <li>, since there's no longer a <ul> once the layout changed.
 */
class UsersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      isLoaded: false,
    };
  }

  componentDidMount() {
    fetch(USERS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.setState({ users: data, isLoaded: true });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ isLoaded: true });
      });
  }

  render() {
    const { users, isLoaded } = this.state;

    if (!isLoaded) {
      return <div style={styles.loading}>Loading...</div>;
    }

    return (
      <div style={styles.page}>
        <h2 style={styles.heading}>List of users:</h2>

        {users.map((user) => (
          <div key={user.id} style={styles.userBlock}>
            <p style={styles.line}>
              <strong>ID:</strong> {user.id}
            </p>
            <p style={styles.line}>
              <strong>Name:</strong> {user.name}
            </p>
            <p style={styles.line}>
              <strong>Username:</strong> {user.username}
            </p>
            <p style={styles.line}>
              <strong>Email:</strong> {user.email}
            </p>
            <p style={styles.line}>
              <strong>City:</strong> {user.address.city}
            </p>
          </div>
        ))}
      </div>
    );
  }
}

const styles = {
  page: {
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  heading: {
    fontSize: "24px",
  },
  loading: {
    textAlign: "center",
    color: "#b5891b",
    fontFamily: "sans-serif",
  },
  userBlock: {
    marginBottom: "20px",
  },
  line: {
    margin: "2px 0",
  },
};

export default UsersList;
