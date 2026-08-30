import React, { Component } from "react";
import FormComponent from "./FormComponent";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      age: "",
      gender: "",
      destination: "",
      lactoseFree: false,
    };
  }

  // Reads event.target off of whichever input changed, and figures
  // out the right value to store : checkboxes are tracked through
  // their `checked` flag, every other input through its `value`.
  handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    this.setState({ [name]: newValue });
  };

  // On submit, build a query string from the current state and
  // push it into the URL, without reloading the page.
  handleSubmit = (event) => {
    event.preventDefault();

    const { firstName, lastName, age, gender, destination, lactoseFree } =
      this.state;

    const params = new URLSearchParams();
    if (firstName) params.append("firstName", firstName);
    if (lastName) params.append("lastName", lastName);
    if (age) params.append("age", age);
    if (gender) params.append("gender", gender);
    if (destination) params.append("destination", destination);
    // Mirrors native HTML form behavior : an unchecked checkbox is
    // simply left out of the submitted data, and a checked one with
    // no explicit `value` attribute submits as "on".
    if (lactoseFree) params.append("lactoseFree", "on");

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  render() {
    return (
      <div className="App">
        <h1>React Form Container</h1>
        <FormComponent
          formData={this.state}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}

export default App;
