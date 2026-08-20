import React, { useState } from "react";

function Phone() {
  // eslint-disable-next-line no-unused-vars
  const [brand, setBrand] = useState("Samsung");
  // eslint-disable-next-line no-unused-vars
  const [model, setModel] = useState("Galaxy S20");
  const [color, setColor] = useState("black");
  // eslint-disable-next-line no-unused-vars
  const [year, setYear] = useState(2020);

  const changeColor = () => {
    setColor("blue");
  };

  return (
    <div>
      <h2>Brand: {brand}</h2>
      <h2>Model: {model}</h2>
      <h2>Color: {color}</h2>
      <h2>Year: {year}</h2>
      <button onClick={changeColor}>Change color</button>
    </div>
  );
}

export default Phone;
