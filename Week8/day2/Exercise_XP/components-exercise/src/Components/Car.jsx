import React, { useState } from "react";
import Garage from "./Garage";

function Car({ carInfo }) {
  // eslint-disable-next-line no-unused-vars
  const [color, setColor] = useState("red");

  return (
    <div>
      <h1>
        This car is {color} {carInfo.model}
      </h1>
      <Garage size="small" />
    </div>
  );
}

export default Car;
