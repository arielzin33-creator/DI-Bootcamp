require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn(
    'Warning: JWT_SECRET and/or JWT_REFRESH_SECRET are not set. Copy .env.example to .env ' +
      'and set real values before running this in anything other than local testing.'
  );
}

app.use(bodyParser.json());
app.use(cookieParser());

// Rate limiting on the endpoints most exposed to brute-force / credential
// stuffing attacks. Tune windowMs/max to your expected traffic.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth/login', authLimiter);
app.use('/auth/refresh', authLimiter);

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('JWT Auth Demo API is running.');
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
