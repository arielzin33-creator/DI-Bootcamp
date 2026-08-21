// STEP 2: MemeGenerator is a CLASS component that fetches an API, in its own file.

import { Component } from 'react';
import axios from 'axios';

class MemeGenerator extends Component {
  constructor(props) {
    super(props);

    // STEP 4: initialize state with top text, bottom text, and a random image.
    this.state = {
      topText: '',
      bottomText: '',
      randomImg: 'http://i.imgflip.com/1bij.jpg',
      allMemeImgs: [], // STEP 5: filled from the API
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // STEP 5: call the API and save the memes array to allMemeImgs.
  //
  // NOTE — the brief says to use `response.data.memes`, but that is one level too shallow
  // for axios. Verified against the live endpoint, the JSON body is:
  //     { "success": true, "data": { "memes": [ ... ] } }
  // and axios puts the whole body on `response.data`. So the array actually lives at
  // `response.data.data.memes`. Using `response.data.memes` yields undefined, which would
  // leave allMemeImgs empty and make the "Gen" button appear to do nothing.
  // (`response.data.memes` WOULD be right with fetch(), i.e. `const data = await res.json()`.)
  componentDidMount() {
    axios
      .get('https://api.imgflip.com/get_memes')
      .then((response) => {
        const { memes } = response.data.data;
        this.setState({ allMemeImgs: memes });
      })
      .catch((error) => {
        // Without this, a failed request leaves allMemeImgs empty and clicking "Gen"
        // would throw on an undefined array element with no explanation.
        console.error('Failed to fetch memes from imgflip:', error);
      });
  }

  // STEP 7: onChange handler — updates the matching state key on every keystroke.
  // Using the input's `name` attribute with a computed property key means one handler
  // serves both inputs, instead of writing a near-identical function for each.
  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  // STEP 9: on submit ("Gen"), pick a random meme from allMemeImgs.
  handleSubmit(event) {
    event.preventDefault(); // stop the browser reloading the page on submit

    const { allMemeImgs } = this.state;
    if (allMemeImgs.length === 0) return; // API hasn't responded yet

    const randNum = Math.floor(Math.random() * allMemeImgs.length);
    const randMemeImgUrl = allMemeImgs[randNum].url;
    this.setState({ randomImg: randMemeImgUrl });
  }

  render() {
    const { topText, bottomText, randomImg } = this.state;

    return (
      <div>
        {/* STEP 5 & 6: a form with two controlled inputs and a button */}
        <form className="meme-form" onSubmit={this.handleSubmit}>
          {/* Controlled inputs: `value` is driven by state and `onChange` writes back
              to it. Without the onChange the field would be read-only, because React
              would keep re-rendering it with the unchanged state value. */}
          <input
            type="text"
            name="topText"
            placeholder="Top Text"
            value={topText}
            onChange={this.handleChange}
          />
          <input
            type="text"
            name="bottomText"
            placeholder="Bottom Text"
            value={bottomText}
            onChange={this.handleChange}
          />
          <button type="submit">Gen</button>
        </form>

        {/* STEP 8: the meme display area */}
        <div className="meme">
          <img src={randomImg} alt="Meme" />
          <h2 className="top">{topText}</h2>
          <h2 className="bottom">{bottomText}</h2>
        </div>
      </div>
    );
  }
}

export default MemeGenerator;
