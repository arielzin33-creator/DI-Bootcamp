const { faker } = require('@faker-js/faker');

const users = [];

function addUser() {
    const user = {
        name: faker.person.fullName(),
        address: {
            street: faker.location.streetAddress(),
            country: faker.location.country()
        }
    };

    users.push(user);
}

// Add a few fake users
addUser();
addUser();
addUser();

console.log(users);