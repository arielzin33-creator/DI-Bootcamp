// STEP 2: Header is a FUNCTION component, in its own file.
// STEP 3: displays the trollface image + a paragraph reading "Meme Generator".

import trollface from '../assets/trollface.png';

function Header() {
  return (
    <header>
      <img src={trollface} alt="Trollface logo" />
      <p>Meme Generator</p>
    </header>
  );
}

export default Header;
