// In-memory user "table" — a stand-in for a real database.
// Replace this module with actual database queries (e.g., Postgres, MongoDB)
// in a production deployment; the shape of the exported functions is written
// so that swap can happen without touching the routes that call it.

const users = [];
let nextId = 1;

function findByUsername(username) {
  return users.find((u) => u.username === username);
}

function findById(id) {
  return users.find((u) => u.id === id);
}

function createUser({ username, passwordHash }) {
  const user = { id: nextId++, username, passwordHash };
  users.push(user);
  return user;
}

function updateUser(id, updates) {
  const user = findById(id);
  if (!user) return null;
  Object.assign(user, updates);
  return user;
}

module.exports = { findByUsername, findById, createUser, updateUser };
