import React from "react";
import Car from "./Components/Car";
import Events from "./Components/Events";
import Phone from "./Components/Phone";
import Color from "./Components/Color";
import "./App.css";

const carinfo = { name: "Ford", model: "Mustang" };

function App() {
  return (
    <div className="app">
      <h1 className="app__xp">Exercise 1: Car and Components</h1>
      <Car carInfo={carinfo} />

      <h1 className="app__xp">Exercise 2: Events</h1>
      <Events />

      <h1 className="app__xp">Exercise 3: Phone and Components</h1>
      <Phone />

      <h1 className="app__xp">Exercise 4: useEffect Hook</h1>
      <Color />
    </div>
  );
}

export default App;
