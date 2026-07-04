const axios = require('axios');
const chalk = require('chalk');

// You'll need a free API key from https://openweathermap.org/api
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const cityName = data.name;
        const temperature = data.main.temp;
        const description = data.weather[0].description;
        const humidity = data.main.humidity;

        console.log(chalk.bold.cyan(`\nWeather in ${cityName}:`));
        console.log(chalk.yellow(`Temperature: ${temperature}°C`));
        console.log(chalk.green(`Description: ${description}`));
        console.log(chalk.blue(`Humidity: ${humidity}%`));

    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log(chalk.red(`City "${city}" not found. Please check the spelling.`));
        } else {
            console.error(chalk.red('Error fetching weather data:'), error.message);
        }
    }
}

module.exports = getWeather;