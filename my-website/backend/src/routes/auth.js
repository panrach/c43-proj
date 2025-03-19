import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../../config/dbConfig.js';

const router = express.Router();
let user = null;

// Registration route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, email]
        );
        if (result.rows.length != 0) {
            user = { id: result.rows[0].id, username: username, email: email };
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                user = { id: user.id, username: user.username, email: user.email };
                req.session.save((err) => {
                    if (err) {
                        console.log('Error saving session:', err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        console.log('Logged in as:', user.username);
                        res.send('Login successful');
                    }
                });
            } else {
                res.status(401).send('Invalid username or password');
            }
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.log('Error during login:', err);
        res.status(500).json({ error: err.message });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy();
    user = null;
    res.send('Logout successful');
});

// Check login status
router.get('/status', (req, res) => {
    req.session.user = user;
    if (req.session.user) {
        console.log('Logged in as:', req.session.user.username, "with id:", req.session.user.id);
        res.send(`Logged in as ${req.session.user.username} ${req.session.user.id}`);
    } else {
        res.send('Not logged in');
    }
});

export default router;