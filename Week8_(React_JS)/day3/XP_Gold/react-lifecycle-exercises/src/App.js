import React, { Component } from "react";
import ErrorBoundary from "./ErrorBoundary";
import FavoriteColor from "./FavoriteColor";

/* ============================================================
   Exercise 1 : BuggyCounter
   The counter starts at 0. Each click adds +1.
   When the counter reaches 5, an error is thrown during render,
   which is exactly what error boundaries are designed to catch.
   ============================================================ */
class BuggyCounter extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  handleClick = () => {
    this.setState(({ counter }) => ({ counter: counter + 1 }));
  };

  render() {
    if (this.state.counter === 5) {
      // Simulate a JS error during rendering
      throw new Error("I crashed!");
    }
    return <h1 onClick={this.handleClick}>{this.state.counter}</h1>;
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // XP Gold - Exercise 1 : holds the value that will crash the
      // render when the "Trigger error" button is clicked. It stays
      // `null` (a valid, renderable child) until the button is
      // clicked, at which point it becomes a plain object, and
      // React cannot render plain objects as children.
      crasher: null,
    };
  }

  // Rendering a plain object as a JSX child throws
  // "Objects are not valid as a React child", which is exactly the
  // kind of render-phase error an Error Boundary is meant to catch.
  triggerError = () => {
    this.setState({ crasher: { message: "Oops! Something went wrong." } });
  };

  // Passed to ErrorBoundary as `onClose`, called when the modal's
  // Close button is clicked. Resets the value that caused the
  // crash, so the boundary's children can render safely again.
  resetCrasher = () => {
    this.setState({ crasher: null });
  };

  render() {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Exercise 1 : React Error Boundary Simulation</h1>
        <p>Click on the numbers to increase the counters.</p>
        <p>The counter is programmed to throw an error when it reaches 5.</p>

        <hr />

        {/* ------------------------------------------------------
            Simulation 1 : two BuggyCounter components wrapped in
            ONE ErrorBoundary. Because both are inside the same
            error boundary, if one crashes, the boundary replaces
            BOTH of them with the fallback UI.
           ------------------------------------------------------ */}
        <p>
          <b>Simulation 1 :</b> These two counters are inside the same error
          boundary. If one crashes, the error boundary will replace both of
          them.
        </p>
        <ErrorBoundary>
          <BuggyCounter />
          <BuggyCounter />
        </ErrorBoundary>

        <hr />

        {/* ------------------------------------------------------
            Simulation 2 : each BuggyCounter has its OWN
            ErrorBoundary. If one crashes, the other keeps working.
           ------------------------------------------------------ */}
        <p>
          <b>Simulation 2 :</b> These two counters are each inside of their own
          error boundary. So if one crashes, the other is not affected.
        </p>
        <ErrorBoundary>
          <BuggyCounter />
        </ErrorBoundary>
        <ErrorBoundary>
          <BuggyCounter />
        </ErrorBoundary>

        <hr />

        {/* ------------------------------------------------------
            Simulation 3 : one BuggyCounter that is NOT wrapped in
            an ErrorBoundary. When it crashes, React unmounts the
            WHOLE component tree : a blank page is displayed and
            the errors appear in the console.

            Uncomment the line below to test it. It is commented
            out by default because once it crashes, it takes the
            entire app (Simulations 1 and 2 included) down with it.
           ------------------------------------------------------ */}
        <p>
          <b>Simulation 3 :</b> This counter is not wrapped in an error
          boundary, so when it crashes, all the other components will be
          deleted and a blank page with errors will be displayed. Uncomment it
          in <code>App.js</code> to test.
        </p>
        {/* <BuggyCounter /> */}

        <hr />

        {/* Exercises 2 and 3 : Updating and Unmounting lifecycle */}
        <h1>Exercises 2 &amp; 3 : Lifecycle</h1>
        <FavoriteColor />

        <hr />

        {/* ------------------------------------------------------
            XP Gold - Exercise 1 : Modal Component with Error
            Handling. Clicking the button replaces `crasher` with a
            plain object, which throws a render-phase error. The
            ErrorBoundary (with its `useModal` prop) catches it and
            displays the Modal component instead of the crashed
            content. Closing the modal resets `crasher` to `null`,
            so the boundary's children render safely again.
           ------------------------------------------------------ */}
        <h1>XP Gold - Exercise 1 : Modal + Error Boundary</h1>
        <p>
          Click the button below to trigger a rendering error. It will be
          caught by the Error Boundary and displayed inside a Modal.
        </p>
        <button type="button" onClick={this.triggerError}>
          Trigger error
        </button>
        <ErrorBoundary useModal onClose={this.resetCrasher}>
          {this.state.crasher}
        </ErrorBoundary>
      </div>
    );
  }
}

export default App;
