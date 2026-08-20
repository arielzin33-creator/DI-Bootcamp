// Exercise: "Implement user registration validation to enforce criteria for usernames
// and passwords."

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUsername(username) {
  const errors = [];
  if (typeof username !== 'string' || username.trim() === '') {
    errors.push('Username is required.');
    return errors;
  }
  if (!USERNAME_RE.test(username)) {
    errors.push(
      'Username must be 3-20 characters and contain only letters, numbers, or underscores.'
    );
  }
  return errors;
}

function validateEmail(email) {
  const errors = [];
  if (typeof email !== 'string' || email.trim() === '') {
    errors.push('Email is required.');
    return errors;
  }
  if (!EMAIL_RE.test(email)) errors.push('Email must be a valid email address.');
  return errors;
}

function validatePassword(password) {
  const errors = [];
  if (typeof password !== 'string' || password === '') {
    errors.push('Password is required.');
    return errors;
  }
  if (password.length < 8) errors.push('Password must be at least 8 characters long.');
  if (password.length > 128) errors.push('Password must be at most 128 characters long.');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter.');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number.');
  return errors;
}

function validateRegistration({ username, email, password }) {
  return [
    ...validateUsername(username),
    ...validateEmail(email),
    ...validatePassword(password),
  ];
}

function validateProfileUpdate({ displayName, bio }) {
  const errors = [];
  if (displayName !== undefined) {
    if (typeof displayName !== 'string' || displayName.trim() === '') {
      errors.push('displayName must be a non-empty string.');
    } else if (displayName.length > 50) {
      errors.push('displayName must be at most 50 characters.');
    }
  }
  if (bio !== undefined) {
    if (typeof bio !== 'string') {
      errors.push('bio must be a string.');
    } else if (bio.length > 300) {
      errors.push('bio must be at most 300 characters.');
    }
  }
  if (displayName === undefined && bio === undefined) {
    errors.push('Provide at least one of: displayName, bio.');
  }
  return errors;
}

module.exports = {
  validateUsername,
  validateEmail,
  validatePassword,
  validateRegistration,
  validateProfileUpdate,
};
