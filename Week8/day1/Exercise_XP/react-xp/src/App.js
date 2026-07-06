import React from 'react';
import UserFavoriteAnimals from './UserFavoriteAnimals';
import Exercise from './Exercise3';

// ---------- Exercise 1 ----------
const myelement = <h1>I Love JSX!</h1>;
const sum = 5 + 5;

// ---------- Exercise 2 ----------
const user = {
  firstName: 'Bob',
  lastName: 'Dylan',
  favAnimals: ['Horse', 'Turtle', 'Elephant', 'Monkey']
};

function App() {
  return (
    <div>
      {/* Exercise 1 */}
      <p>Hello World!</p>
      {myelement}
      <p>React is {sum} times better with JSX</p>

      <hr />

      {/* Exercise 2 */}
      <h3>{user.firstName}</h3>
      <h3>{user.lastName}</h3>
      <UserFavoriteAnimals favAnimals={user.favAnimals} />

      <hr />

      {/* Exercise 3 */}
      <Exercise />
    </div>
  );
}

export default App;
