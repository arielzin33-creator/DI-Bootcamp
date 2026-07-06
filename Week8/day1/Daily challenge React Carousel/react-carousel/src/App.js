import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './App.css';

const destinations = [
  {
    name: 'Hong Kong',
    imageUrl:
      'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/jrfyzvgzvhs1iylduuhj.jpg',
  },
  {
    name: 'Macao',
    imageUrl:
      'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/c1cklkyp6ms02tougufx.webp',
  },
  {
    name: 'Japan',
    imageUrl:
      'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/e8fnw35p6zgusq218foj.webp',
  },
  {
    name: 'Las Vegas',
    imageUrl:
      'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/liw377az16sxmp9a6ylg.webp',
  },
];

function App() {
  return (
    <div className="carousel-wrapper">
      <h1 className="carousel-title">Top Destinations</h1>
      <Carousel
        showArrows={true}
        infiniteLoop={true}
        autoPlay={true}
        interval={3000}
        showThumbs={true}
        showStatus={false}
      >
        {destinations.map((destination, index) => (
          <div key={index}>
            <img src={destination.imageUrl} alt={destination.name} />
            <p className="legend">{destination.name}</p>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default App;
