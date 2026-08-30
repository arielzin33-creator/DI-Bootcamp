import React from "react";
import Customers from "./components/Customers.jsx";

// A simple, original atom-style icon (three tilted orbit ellipses
// plus a center dot) rather than a reproduction of any specific
// framework's trademarked logo artwork.
function AtomIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      stroke="#61dafb"
      strokeWidth="2"
    >
      <circle cx="30" cy="30" r="4" fill="#61dafb" stroke="none" />
      <ellipse cx="30" cy="30" rx="24" ry="9" />
      <ellipse cx="30" cy="30" rx="24" ry="9" transform="rotate(60 30 30)" />
      <ellipse cx="30" cy="30" rx="24" ry="9" transform="rotate(120 30 30)" />
    </svg>
  );
}

function App() {
  return (
    <div>
      <header style={styles.header}>
        <AtomIcon />
        <h1 style={styles.title}>React &amp; Express</h1>
      </header>

      <Customers />
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: "#282c34",
    color: "#fff",
    padding: "32px 16px",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: "24px",
    margin: "16px 0 0",
  },
};

export default App;
