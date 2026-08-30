import React, { useState } from "react";

function Events() {
  const [isToggleOn, setIsToggleOn] = useState(true);

  const clickMe = () => {
    alert("I was clicked");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      alert(`You typed: ${event.target.value}`);
    }
  };

  const handleToggle = () => {
    setIsToggleOn((prevState) => !prevState);
  };

  return (
    <div>
      <button onClick={clickMe}>Click me</button>

      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter"
      />

      <button onClick={handleToggle}>{isToggleOn ? "ON" : "OFF"}</button>
    </div>
  );
}

export default Events;
