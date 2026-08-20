import React from "react";
import FormData from "./components/FormData";
import UserForm from "./components/UserForm";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1 className="app__title">Exercise 1: Use data from a Form</h1>
      <FormData />

      <h1 className="app__title">Exercise 2: Display user input from a Form</h1>
      <UserForm />
    </div>
  );
}

export default App;
