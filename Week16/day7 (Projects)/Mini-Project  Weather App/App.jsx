import { Component } from 'react';

import Titles from './components/Titles';
import Form from './components/Form';
import Weather from './components/Weather';
import './App.css';

// Read the key from an env file so it isn't hardcoded in source. See README for setup.
//
// SECURITY NOTE: any key used in a browser app is visible to users — Vite inlines
// VITE_-prefixed vars into the bundle, and the request URL is right there in devtools.
// That's unavoidable for a front-end-only project like this one and fine for a free
// OpenWeatherMap key, but a key with real cost or write access must never be shipped
// this way; it belongs behind your own backend.
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

class App extends Component {
  constructor(props) {
    super(props);

    // The brief's required state: city, country, temperature, humidity,
    // condition description, and an error flag.
    this.state = {
      city: undefined,
      country: undefined,
      temperature: undefined,
      humidity: undefined,
      description: undefined,
      error: undefined,
      loading: false,
    };

    this.getWeather = this.getWeather.bind(this);
  }

  clearResults(extra = {}) {
    return {
      city: undefined,
      country: undefined,
      temperature: undefined,
      humidity: undefined,
      description: undefined,
      error: undefined,
      ...extra,
    };
  }

  async getWeather(event) {
    event.preventDefault(); // stop the browser reloading the page

    const city = event.target.elements.city.value.trim();
    const country = event.target.elements.country.value.trim();

    if (!city || !country) {
      this.setState(this.clearResults({ error: 'Please enter both a city and a country.' }));
      return;
    }

    if (!API_KEY) {
      this.setState(
        this.clearResults({
          error: 'No API key found. Add VITE_WEATHER_API_KEY to a .env file (see README).',
        })
      );
      return;
    }

    this.setState({ loading: true });

    try {
      const url =
        `https://api.openweathermap.org/data/2.5/weather` +
        `?q=${encodeURIComponent(city)},${encodeURIComponent(country)}` +
        `&units=metric&appid=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      // OpenWeatherMap returns HTTP 200 with an error body in some cases, so checking
      // `response.ok` alone isn't enough — the `cod` field has to be inspected too.
      // Also note `cod` is a NUMBER for 401 but a STRING ("404") for city-not-found,
      // so it's coerced with String() before comparing.
      if (!response.ok || String(data.cod) !== '200') {
        let message = data.message || 'Something went wrong. Please try again.';

        if (String(data.cod) === '404') {
          message = `Couldn't find "${city}, ${country}". Check the spelling and try again.`;
        } else if (String(data.cod) === '401') {
          message = 'Invalid API key. Check VITE_WEATHER_API_KEY in your .env file.';
        } else if (String(data.cod) === '429') {
          message = 'Too many requests — the free plan limit was hit. Try again shortly.';
        }

        this.setState(this.clearResults({ error: message, loading: false }));
        return;
      }

      this.setState({
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        error: undefined,
        loading: false,
      });
    } catch (err) {
      // Network failure / offline — distinct from an API error response.
      console.error('Weather request failed:', err);
      this.setState(
        this.clearResults({
          error: 'Could not reach the weather service. Check your connection.',
          loading: false,
        })
      );
    }
  }

  render() {
    const { city, country, temperature, humidity, description, error, loading } = this.state;

    return (
      <div className="wrapper">
        <div className="main">
          <div className="container">
            <div className="row">
              <div className="col title-col">
                <Titles />
              </div>
              <div className="col form-container">
                <Form getWeather={this.getWeather} loading={loading} />
                <Weather
                  city={city}
                  country={country}
                  temperature={temperature}
                  humidity={humidity}
                  description={description}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
