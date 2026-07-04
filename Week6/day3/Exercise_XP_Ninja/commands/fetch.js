const axios = require('axios');

async function fetchData() {
    try {
        // Using JSONPlaceholder as a free, keyless public API for demonstration
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');

        console.log('Fetched data:');
        console.log(response.data);

    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

module.exports = fetchData;