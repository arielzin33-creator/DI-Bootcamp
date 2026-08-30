/**
 * An in-memory array standing in for a real users table. Every function
 * below is `async`, even though nothing here actually awaits anything yet
 * — that's deliberate: it means every call site in the rest of the app
 * already treats "look up a user" as an operation that could involve I/O,
 * so swapping this file for a real database client later (the "replace
 * in-memory storage" exercise the guide lists) doesn't require touching
 * `routes/auth.js` or `routes/profile.js` at all, only this file.
 *
 * This also means the data disappears on every restart — there is no
 * persistence, by design, until that swap happens.
 */
const users = [];
let nextId = 1;

export async function findUserByUsername(username) {
  return users.find((user) => user.username === username) ?? null;
}

export async function findUserById(id) {
  return users.find((user) => user.id === id) ?? null;
}

export async function createUser({ username, passwordHash }) {
  const user = { id: nextId++, username, passwordHash, bio: '' };
  users.push(user);
  return user;
}

export async function updateUserBio(id, bio) {
  const user = await findUserById(id);
  if (!user) return null;
  user.bio = bio;
  return user;
}

/** Test-only: returns to a clean slate between test files/cases. */
export function _resetUsersForTesting() {
  users.length = 0;
  nextId = 1;
}
