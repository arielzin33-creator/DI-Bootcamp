const express = require('express');
const usersStore = require('../data/users');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// GET /profile — requires a valid access token.
router.get('/', authenticateToken, (req, res) => {
  const user = usersStore.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.status(200).json({ id: user.id, username: user.username });
});

// PATCH /profile — allows an authenticated user to update their own username.
// (Exercise: "allow authenticated users to update their profile information.")
router.patch('/', authenticateToken, (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Nothing to update.' });
  }

  const existing = usersStore.findByUsername(username);
  if (existing && existing.id !== req.user.id) {
    return res.status(409).json({ message: 'That username is already taken.' });
  }

  const updated = usersStore.updateUser(req.user.id, { username });
  if (!updated) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json({ message: 'Profile updated.', user: { id: updated.id, username: updated.username } });
});

module.exports = router;
