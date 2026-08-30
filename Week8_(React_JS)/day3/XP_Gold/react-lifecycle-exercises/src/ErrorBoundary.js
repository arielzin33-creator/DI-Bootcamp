import React, { Component } from "react";
import Modal from "./Modal";

// Exercise 1 : Error Boundary
// Catches JavaScript errors anywhere in the child component tree,
// logs them, and displays a fallback UI instead of the crashed tree.
//
// XP Gold update : the component now also exposes the `hasError` /
// `occurError` API required by the "Modal Component with Error
// Handling" exercise, on top of its original `error` / `errorInfo`
// state used by Exercise 1's BuggyCounter simulations.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false, // XP Gold : starts at false
      error: null,
      errorInfo: null, // defaults to null, as requested
    };
  }

  // XP Gold : dedicated method that flips hasError to true and
  // records the error details, called from componentDidCatch.
  occurError(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo,
    });
  }

  // Lifecycle method called when a child component throws an error.
  componentDidCatch(error, errorInfo) {
    // Log the error (could also be sent to an error reporting service)
    console.log("Error caught by ErrorBoundary:", error, errorInfo);
    this.occurError(error, errorInfo);
  }

  // Resets the boundary's own state, and lets the parent (App.js)
  // know so it can reset whatever triggered the error in the first
  // place - otherwise the same crash would happen again immediately.
  closeModal = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    if (this.state.hasError) {
      // XP Gold : when the `useModal` prop is set, show the error
      // inside the Modal component instead of the plain <details>
      // fallback used by Exercise 1's BuggyCounter simulations.
      if (this.props.useModal) {
        return (
          <Modal onClose={this.closeModal}>
            <p>
              Oops! An error has occurred:{" "}
              {this.state.error && this.state.error.toString()}
            </p>
          </Modal>
        );
      }

      // Default fallback UI, unchanged from Exercise 1.
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // No error : render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
