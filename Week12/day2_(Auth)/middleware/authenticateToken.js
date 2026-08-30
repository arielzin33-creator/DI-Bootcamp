const jwt = require('jsonwebtoken');

// Verifies a JWT access token sent as: Authorization: Bearer <token>
// - 401 Unauthorized: no token was supplied.
// - 403 Forbidden: a token was supplied but is invalid, malformed, or expired.
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired access token.' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
