import React from "react";

/**
 * ErrorBoundary
 *
 * A class component (error boundaries must be classes — there is no
 * hook equivalent for componentDidCatch/getDerivedStateFromError as
 * of React 18). Wrapping a subtree in this component means a render
 * error thrown anywhere inside it is caught here instead of crashing
 * the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // React calls this during the "commit" phase, mainly for side
  // effects like logging the error. Per the exercise, this is where
  // hasError gets set to true.
  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger" role="alert">
          Something went wrong while rendering this page.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
