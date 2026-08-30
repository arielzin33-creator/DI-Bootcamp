const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
    try {
        const { name, lastName, email, username, password } = req.body;
        
        if (!name || !lastName || !email || !username || !password) {
            return res.status(400).json({ error: 'All registration parameters are required.' });
        }

        const users = await userModel.readUsersFile();

        // Check if the username or email already exists
        const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            name,
            lastName,
            email,
            username,
            password: hashedPassword
        };

        users.push(newUser);
        await userModel.writeUsersFile(users);

        // Sanitize output password string
        const { password: _, ...sanitizedUser } = newUser;
        res.status(201).json({ message: 'The user has been registered', user: sanitizedUser });
    } catch (err) { next(err); }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password fields are mandatory.' });
        }

        const users = await userModel.readUsersFile();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!user) {
            return res.status(401).json({ message: 'User not registered' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'User not registered or invalid credentials' });
        }

        res.status(200).json({ message: 'The user has logged in' });
    } catch (err) { next(err); }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await userModel.readUsersFile();
        // Remove passwords before presenting user summaries
        const sanitizedUsers = users.map(({ password, ...rest }) => rest);
        res.status(200).json(sanitizedUsers);
    } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const users = await userModel.readUsersFile();
        const user = users.find(u => u.id === id);

        if (!user) return res.status(404).json({ error: 'User profiles targeted could not be found' });

        const { password, ...sanitizedUser } = user;
        res.status(200).json(sanitizedUser);
    } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, lastName, email } = req.body;

        const users = await userModel.readUsersFile();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return res.status(404).json({ error: 'User targets profile could not be found' });

        if (name) users[index].name = name;
        if (lastName) users[index].lastName = lastName;
        if (email) users[index].email = email;

        await userModel.writeUsersFile(users);

        const { password, ...sanitizedUser } = users[index];
        res.status(200).json({ message: 'User record updated details synchronized', user: sanitizedUser });
    } catch (err) { next(err); }
};

module.exports = { register, login, getUsers, getUserById, updateUser };
