import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Called during the "render" phase, as soon as a descendant throws.
  // Used to update state so that the next render shows the fallback UI.
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  // Called during the "commit" phase, so it can be used for side effects,
  // such as logging the error to a reporting service.
  componentDidCatch(error, errorInfo) {
    console.log('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI. In production, it's best not to expose the raw error
      // and component stack to the end user - a friendlier message would
      // normally be shown instead.
      return (
        <div className="card my-5">
          <div className="card-body">
            <h3 className="card-title">Something went wrong.</h3>
            <p className="card-text">
              An error was caught by the Error Boundary. Details below are
              shown for learning purposes only, they should not be displayed
              to end users in production.
            </p>

            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>

            <button
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    // No error : render the children normally.
    return this.props.children;
  }
}
