const axios = require('axios');

async function fetchPostTitles() {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');

        const posts = response.data;

        posts.forEach(post => {
            console.log(post.title);
        });

    } catch (error) {
        console.error('Error fetching posts:', error.message);
    }
}

module.exports = fetchPostTitles;