const express = require('express');
const { createJSONToken, isValidPassword } = require('../util/auth');
const { isValidEmail, isValidText } = require('../util/validation');
const {
    createUser,
    getUserByEmailOrUsername,
    checkPassword,
    getUserId,
    isAvailableUsername,
    checkAuth
} = require('../util/db');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    const data = req.body;
    let errors = {};

    if (!isValidEmail(data.email)) {
        errors.email = 'Invalid email.';
    } else {
        try {
            const existingUser = await getUserByEmailOrUsername(data.email);
            if (existingUser) {
                errors.email = 'Email exists already.';
            }
        } catch (error) {
            next(error);
            return;
        }
    }

    if (!isValidText(data.password, 6)) {
        errors.password =
            'Invalid password. Must be at least 6 characters long.';
    }

    if (!isValidText(data.username, 6)) {
        errors.username =
            'Invalid username. Must be at least 6 characters long';
    }

    if (!await isAvailableUsername(data.username)) {
        errors.username =
            'Username already exists. Please try again.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(422).json({
            message: 'User signup failed due to validation errors.',
            errors,
        });
    }

    try {
        const createdUser = await createUser(data);
        const authToken = createJSONToken(createdUser.id);
        res.status(201).json({
            message: 'User created.',
            user: createdUser,
            token: authToken,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res) => {
    const identifier = req.body.identifier;
    console.log(identifier);
    const password = req.body.password;
    console.log(password);
    const id = await getUserId(identifier);
    console.log(id);

    try {
        const user = await getUserByEmailOrUsername(identifier);
        if(user === undefined) {
            return res.status(404).json({ message: 'User does not exist!' });
        }

        console.log('pass: ', password, ' db pass: ', user.password);

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed.' });
        }

        const pwIsValid = await checkPassword(password, user.password);

        if (!pwIsValid) {
            return res.status(422).json({
                message: 'Invalid credentials.',
                errors: { credentials: 'Invalid email or password entered.' },
            });
        }

        const token = createJSONToken(id);

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.post('/checkAuthorization', async (req, res) => {
    try {
        const { identifier, id } = req.body;

        const rows = await checkAuth(identifier);

        if (!rows || rows.length === 0) {
            return res.status(401).json({ isAuthorized: false });
        }

        const userIdFromDB = rows[0].id;
        const isAuthorized = userIdFromDB === id;

        res.json({ isAuthorized });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

process.on('exit', () => {
    db.close();
});

module.exports = router;
