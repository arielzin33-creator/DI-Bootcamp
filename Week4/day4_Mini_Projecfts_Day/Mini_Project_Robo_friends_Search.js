const robots = [{
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
        image: 'https://robohash.org/1?200x200'
    },
    {
        id: 2,
        name: 'Ervin Howell',
        username: 'Antonette',
        email: 'Shanna@melissa.tv',
        image: 'https://robohash.org/2?200x200'
    },
    {
        id: 3,
        name: 'Clementine Bauch',
        username: 'Samantha',
        email: 'Nathan@yesenia.net',
        image: 'https://robohash.org/3?200x200'
    },
    {
        id: 4,
        name: 'Patricia Lebsack',
        username: 'Karianne',
        email: 'Julianne.OConner@kory.org',
        image: 'https://robohash.org/4?200x200'
    },
    {
        id: 5,
        name: 'Chelsey Dietrich',
        username: 'Kamren',
        email: 'Lucio_Hettinger@annie.ca',
        image: 'https://robohash.org/5?200x200'
    },
    {
        id: 6,
        name: 'Mrs. Dennis Schulist',
        username: 'Leopoldo_Corkery',
        email: 'Karley_Dach@jasper.info',
        image: 'https://robohash.org/6?200x200'
    },
    {
        id: 7,
        name: 'Kurtis Weissnat',
        username: 'Elwyn.Skiles',
        email: 'Telly.Hoeger@billy.biz',
        image: 'https://robohash.org/7?200x200'
    },
    {
        id: 8,
        name: 'Nicholas Runolfsdottir V',
        username: 'Maxime_Nienow',
        email: 'Sherwood@rosamond.me',
        image: 'https://robohash.org/8?200x200'
    },
    {
        id: 9,
        name: 'Glenna Reichert',
        username: 'Delphine',
        email: 'Chaim_McDermott@dana.io',
        image: 'https://robohash.org/9?200x200'
    },
    {
        id: 10,
        name: 'Clementina DuBuque',
        username: 'Moriah.Stanton',
        email: 'Rey.Padberg@karina.biz',
        image: 'https://robohash.org/10?200x200'
    }
];

// Grab the DOM elements we need
const cardContainer = document.getElementById('cardContainer');
const searchBox = document.getElementById('searchBox');
const searchForm = document.getElementById('searchForm');

/**
 * Builds and appends a robot card element to the container for each
 * robot in the given array.
 * @param {Array} robotsToRender - the array of robot objects to display
 */
function renderRobots(robotsToRender) {
    // Clear out whatever is currently displayed
    cardContainer.innerHTML = '';

    if (robotsToRender.length === 0) {
        const noResults = document.createElement('p');
        noResults.classList.add('no-results');
        noResults.textContent = 'No robots match your search.';
        cardContainer.appendChild(noResults);
        return;
    }

    robotsToRender.forEach((robot) => {
        const card = document.createElement('div');
        card.classList.add('robot-card');

        const img = document.createElement('img');
        img.src = robot.image;
        img.alt = robot.name;

        const name = document.createElement('h3');
        name.textContent = robot.name;

        const username = document.createElement('p');
        username.textContent = `Username: ${robot.username}`;

        const email = document.createElement('p');
        email.textContent = `Email: ${robot.email}`;

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(username);
        card.appendChild(email);

        cardContainer.appendChild(card);
    });
}

/**
 * Filters the robots array using Array.prototype.filter() based on the
 * current search box value, matching against name or username.
 * @param {string} searchTerm
 * @returns {Array} the filtered array of robots
 */
function filterRobots(searchTerm) {
    const term = searchTerm.toLowerCase();
    return robots.filter((robot) => {
        return (
            robot.name.toLowerCase().includes(term) ||
            robot.username.toLowerCase().includes(term)
        );
    });
}

// Re-render the cards live as the user types, without reloading the page
searchBox.addEventListener('input', (event) => {
    const filteredRobots = filterRobots(event.target.value);
    renderRobots(filteredRobots);
});

// Prevent the form's submit button from reloading the page
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const filteredRobots = filterRobots(searchBox.value);
    renderRobots(filteredRobots);
});

// Initial render: show all robots on page load
renderRobots(robots);
