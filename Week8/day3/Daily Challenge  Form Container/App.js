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

  handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    this.setState({ [name]: newValue });
  };

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
