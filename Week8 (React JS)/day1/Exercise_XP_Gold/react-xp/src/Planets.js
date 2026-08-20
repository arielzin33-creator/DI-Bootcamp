import React from 'react';

const planets = ['Mars', 'Venus', 'Jupiter', 'Earth', 'Saturn', 'Neptune'];

function Planets() {
  return (
    <ul className="list-group">
      {planets.map((planet, index) => (
        <li className="list-group-item" key={index}>
          {planet}
        </li>
      ))}
    </ul>
  );
}

export default Planets;
