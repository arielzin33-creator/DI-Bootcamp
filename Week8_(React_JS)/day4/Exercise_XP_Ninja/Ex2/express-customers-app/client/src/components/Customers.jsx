import React from "react";

const CUSTOMERS_URL = "/api/customers/";

/**
 * Customers
 *
 * Fetches the customer list from the Express backend on mount and
 * stores it in state, per the exercise's instructions.
 */
class Customers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
    };
  }

  componentDidMount() {
    fetch(CUSTOMERS_URL)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ customers: data });
      })
      .catch((error) => {
        console.error("Failed to fetch customers:", error);
      });
  }

  render() {
    const { customers } = this.state;

    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Customers</h2>
        <ul style={styles.list}>
          {customers.map((customer) => (
            <li key={customer.id} style={styles.row}>
              {customer.firstName} {customer.lastName}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const styles = {
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "32px 16px",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  heading: {
    fontSize: "22px",
    marginBottom: "16px",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  row: {
    padding: "10px 0",
    borderBottom: "1px dashed #ccc",
  },
};

export default Customers;
