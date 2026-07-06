import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import UserFavoriteAnimals from './UserFavoriteAnimals';
import Exercise from './Exercise3';
import BootstrapCard from './BootstrapCard';
import Planets from './Planets';

// ---------- Exercise 1 ----------
const myelement = <h1>I Love JSX!</h1>;
const sum = 5 + 5;

// ---------- Exercise 2 ----------
const user = {
  firstName: 'Bob',
  lastName: 'Dylan',
  favAnimals: ['Horse', 'Turtle', 'Elephant', 'Monkey']
};

// ---------- XP Gold Exercise 1 ----------
const celebrities = [
  {
    title: 'Bob Dylan',
    imageUrl: 'https://miro.medium.com/max/4800/1*_EDEWvWLREzlAvaQRfC_SQ.jpeg',
    buttonLabel: 'Go to Wikipedia',
    buttonUrl: 'https://en.wikipedia.org/wiki/Bob_Dylan',
    description:
      'Bob Dylan (born Robert Allen Zimmerman, May 24, 1941) is an American singer/songwriter, author, and artist who has been an influential figure in popular music and culture for more than five decades.',
  },
  {
    title: 'McCartney',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Paul_McCartney_in_October_2018.jpg/240px-Paul_McCartney_in_October_2018.jpg',
    buttonLabel: 'Go to Wikipedia',
    buttonUrl: 'https://en.wikipedia.org/wiki/Paul_McCartney',
    description:
      'Sir James Paul McCartney CH MBE (born 18 June 1942) is an English singer, songwriter, musician, composer, and record and film producer who gained worldwide fame as co-lead vocalist and bassist for the Beatles.',
  },
];

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

      <hr />

      {/* XP Gold Exercise 1: Bootstrap Cards */}
      <BootstrapCard
        title={celebrities[0].title}
        imageUrl={celebrities[0].imageUrl}
        buttonLabel={celebrities[0].buttonLabel}
        buttonUrl={celebrities[0].buttonUrl}
        description={celebrities[0].description}
      />
      <BootstrapCard
        title={celebrities[1].title}
        imageUrl={celebrities[1].imageUrl}
        buttonLabel={celebrities[1].buttonLabel}
        buttonUrl={celebrities[1].buttonUrl}
        description={celebrities[1].description}
      />

      <hr />

      {/* XP Gold Exercise 2: Planets */}
      <Planets />
    </div>
  );
}

export default App;
