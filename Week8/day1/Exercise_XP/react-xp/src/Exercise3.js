import React from 'react';
import './Exercise.css';

const style_header = {
  color: "white",
  backgroundColor: "DodgerBlue",
  padding: "10px",
  fontFamily: "Arial"
};

class Exercise extends React.Component {
  render() {
    return (
      <div>
        <h1 style={style_header}>This is my styled heading</h1>

        <p className="para">
          This is a paragraph styled using the Exercise.css file.
        </p>

        <a href="https://www.google.com" target="_blank" rel="noreferrer">
          Visit Google
        </a>

        <form>
          <label>
            Name:
            <input type="text" name="name" />
          </label>
          <button type="submit">Submit</button>
        </form>

        <img
          src="https://via.placeholder.com/150"
          alt="placeholder"
        />

        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    );
  }
}

export default Exercise;
