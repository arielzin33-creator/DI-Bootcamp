import React, { Component } from "react";

/* ============================================================
   Exercise 3 : Child component (Unmounting phase)
   Rendered only while `show` is true in FavoriteColor's state.
   componentWillUnmount fires right before it is removed
   from the DOM.
   ============================================================ */
class Child extends Component {
  componentWillUnmount() {
    alert("The component named Child is about to be unmounted.");
  }

  render() {
    return <h1>Hello World!</h1>;
  }
}

/* ============================================================
   Exercise 2 : Updating phase (based on yesterday's Exercise XP 4,
   rewritten as a Class Component)
   Order of the update lifecycle methods :
   getDerivedStateFromProps -> shouldComponentUpdate -> render
   -> getSnapshotBeforeUpdate -> componentDidUpdate
   ============================================================ */
class FavoriteColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favoriteColor: "red",
      show: true, // Exercise 3 : controls the rendering of <Child />
    };
  }

  // Mounting : after 1 second, a timer changes the color to yellow.
  componentDidMount() {
    setTimeout(() => {
      this.setState({ favoriteColor: "yellow" });
    }, 1000);
  }

  /* Part I : shouldComponentUpdate
     Returning true (the default) lets React re-render on every
     state/props change. If you change this to `return false`,
     clicking the button will update the state internally but the
     component will NEVER re-render, so "blue" will never appear. */
  shouldComponentUpdate() {
    return true;
  }

  /* Part III : getSnapshotBeforeUpdate
     Runs right before the DOM is updated, so we still have access
     to the previous props and state here. It must return a value
     (or null), which is passed to componentDidUpdate as the third
     argument. If this method exists, componentDidUpdate is required. */
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log("in getSnapshotBeforeUpdate");
    console.log("Before the update, the favorite color was:", prevState.favoriteColor);
    return null;
  }

  /* Part II : componentDidUpdate
     Runs after the component has been re-rendered in the DOM. */
  componentDidUpdate() {
    console.log("after update");
  }

  changeColor = () => {
    this.setState({ favoriteColor: "blue" });
  };

  /* Exercise 3 : the Delete button sets show to false,
     which unmounts the Child component. */
  deleteChild = () => {
    this.setState({ show: false });
  };

  render() {
    return (
      <div>
        <h1>My Favorite Color is {this.state.favoriteColor}</h1>
        <button type="button" onClick={this.changeColor}>
          Change color
        </button>

        {/* Exercise 3 : conditional rendering of the Child component */}
        {this.state.show && <Child />}

        <button type="button" onClick={this.deleteChild}>
          Delete
        </button>
      </div>
    );
  }
}

export default FavoriteColor;
