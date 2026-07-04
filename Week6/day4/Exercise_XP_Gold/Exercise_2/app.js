const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(express.json());

// In-memory "database" of users, since no real DB was specified
const users = [];

// Secret used to sign JWTs — in a real app, this MUST come from an environment variable, never hardcoded
const JWT_SECRET = 'your-secret-key-change-this-in-production';

const SALT_ROUNDS = 10;

// ---------- User Registration ----------
app.post('/api/register', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(409).json({ error: 'Username already taken.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword
        };

        users.push(newUser);

        res.status(201).json({ message: 'User registered successfully.', userId: newUser.id });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Failed to register user.' });
    }
});

// ---------- User Login ----------
app.post('/api/login', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    try {
        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Failed to log in.' });
    }
});

// ---------- Middleware: Authenticate Token ----------
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // expects "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access token is required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = decoded;
        next();
    });
}

// ---------- User Profile (protected route) ----------
app.get('/api/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ id: user.id, username: user.username });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});