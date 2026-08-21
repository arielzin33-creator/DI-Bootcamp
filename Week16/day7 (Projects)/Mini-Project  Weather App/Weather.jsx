// Displays the results held in the parent's state.
//
// Each row renders only when its value exists, so the panel stays empty on first load
// instead of showing a column of "undefined".
//
// Note the `!== undefined` checks on temperature and humidity rather than plain
// truthiness: a real reading of 0°C or 0% humidity is falsy, and `{temperature && ...}`
// would silently hide a legitimate value.

function Weather({ city, country, temperature, humidity, description, error }) {
  return (
    <div className="weather__info">
      {city && country && (
        <p className="weather__key">
          Location:{' '}
          <span className="weather__value">
            {city}, {country}
          </span>
        </p>
      )}
      {temperature !== undefined && (
        <p className="weather__key">
          Temperature: <span className="weather__value">{temperature}°C</span>
        </p>
      )}
      {humidity !== undefined && (
        <p className="weather__key">
          Humidity: <span className="weather__value">{humidity}%</span>
        </p>
      )}
      {description && (
        <p className="weather__key">
          Conditions: <span className="weather__value">{description}</span>
        </p>
      )}
      {error && <p className="weather__error">{error}</p>}
    </div>
  );
}

export default Weather;
