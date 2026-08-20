import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { findUserById, updateUserBio } from '../data/users.js';

const router = Router();

// Every route in this file requires a valid access token — applied once,
// to the whole router, rather than repeated on each individual route.
router.use(authenticateToken);

router.get('/', async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ id: user.id, username: user.username, bio: user.bio });
});

router.patch('/', async (req, res) => {
  const { bio } = req.body ?? {};
  if (typeof bio !== 'string') {
    return res.status(400).json({ error: 'bio must be a string.' });
  }
  if (bio.length > 280) {
    return res.status(400).json({ error: 'bio must be 280 characters or fewer.' });
  }

  const user = await updateUserBio(req.user.id, bio);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ id: user.id, username: user.username, bio: user.bio });
});

export default router;
