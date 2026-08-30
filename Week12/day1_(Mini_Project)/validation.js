const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Returns an array of human-readable problems — empty means valid. An
 * array rather than a single message so the client can show every
 * problem at once instead of one at a time across repeated failed
 * submissions.
 */
export function validateRegistration({ username, password }) {
  const errors = [];

  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username)) {
    errors.push('Username must be 3-20 characters and contain only letters, numbers, and underscores.');
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  } else {
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      errors.push('Password must contain both uppercase and lowercase letters.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number.');
    }
  }

  return errors;
}
