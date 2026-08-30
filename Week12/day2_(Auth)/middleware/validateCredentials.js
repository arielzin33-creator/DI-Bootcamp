// Basic registration validation:
// - username: 3-20 characters, letters/numbers/underscores only.
// - password: at least 8 characters, with at least one letter and one number.
// Adjust these rules to fit your application's actual policy.

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function validateCredentials(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (!USERNAME_REGEX.test(username)) {
    return res.status(400).json({
      message:
        'Username must be 3-20 characters and contain only letters, numbers, or underscores.',
    });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include at least one letter and one number.',
    });
  }

  next();
}

module.exports = validateCredentials;
