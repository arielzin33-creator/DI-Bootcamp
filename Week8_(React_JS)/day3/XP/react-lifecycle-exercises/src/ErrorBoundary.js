import React, { Component } from "react";

// Exercise 1 : Error Boundary
// Catches JavaScript errors anywhere in the child component tree,
// logs them, and displays a fallback UI instead of the crashed tree.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  // Lifecycle method called when a child component throws an error.
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // Log the error (could also be sent to an error reporting service)
    console.log("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // Fallback UI shown instead of the crashed component tree
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // No error : render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
