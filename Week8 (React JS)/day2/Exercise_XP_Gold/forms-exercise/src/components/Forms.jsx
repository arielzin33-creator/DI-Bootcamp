import React, { useState } from "react";

function Forms() {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState(null);
  const [errormessage, setErrormessage] = useState("");
  const [comment, setComment] = useState("Write your comment here.");
  const [car, setCar] = useState("Volvo");

  const myChangeHandler = (event) => {
    const { name, value } = event.target;

    if (name === "username") {
      setUsername(value);
    }

    if (name === "age") {
      setAge(value);
      if (isNaN(value) || value.trim() === "") {
        setErrormessage("The age must be a number!");
      } else {
        setErrormessage("");
      }
    }
  };

  const mySubmitHandler = (event) => {
    event.preventDefault();
    alert(username);
  };

  const myCarHandler = (event) => {
    setCar(event.target.value);
  };

  let header = null;
  if (username || age) {
    header = (
      <h1>
        {username} {age}
      </h1>
    );
  }

  return (
    <div className="forms">
      {header}

      <form onSubmit={mySubmitHandler}>
        <input
          type="text"
          name="username"
          value={username}
          onChange={myChangeHandler}
          placeholder="Enter your name"
        />
        <input
          type="text"
          name="age"
          value={age === null ? "" : age}
          onChange={myChangeHandler}
          placeholder="Enter your age"
        />
        <button type="submit">Submit</button>
      </form>

      {errormessage && <p className="forms__error">{errormessage}</p>}

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />

      <select value={car} onChange={myCarHandler}>
        <option value="Volvo">Volvo</option>
        <option value="Saab">Saab</option>
        <option value="Fiat">Fiat</option>
        <option value="Audi">Audi</option>
      </select>
    </div>
  );
}

export default Forms;
