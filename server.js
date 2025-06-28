const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Replace with your MySQL username
    password: 'Alanserrao12!@', // Replace with your actual MySQL password
    database: 'votepro_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log(`User logged in: Email=${email}, UserID=${user.id}`);
        res.json({ message: 'Login successful', user: { email: user.email, id: user.id } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Sign-up Endpoint
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [existing] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.promise().query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        console.log(`User signed up: Email=${email}, UserID=${result.insertId}`);
        res.json({ message: 'Sign-up successful', userId: result.insertId });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Profile Fetch Endpoint
app.get('/api/profile', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const [rows] = await db.promise().query(
            'SELECT full_name, date_of_birth, marital_status, profession, voter_id, mobile FROM users WHERE email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ profile: rows[0] });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Profile Update Endpoint
app.post('/api/profile', async (req, res) => {
    const { email, fullName, dob, maritalStatus, profession, voterId, mobile } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const [result] = await db.promise().query(
            'UPDATE users SET full_name = ?, date_of_birth = ?, marital_status = ?, profession = ?, voter_id = ?, mobile = ? WHERE email = ?',
            [fullName, dob, maritalStatus, profession, voterId, mobile, email]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Voting Endpoint
app.post('/api/vote', async (req, res) => {
    const { userId, candidate } = req.body;
    if (!userId || !candidate) {
        return res.status(400).json({ error: 'User ID and candidate are required' });
    }

    try {
        const [existingVote] = await db.promise().query('SELECT * FROM votes WHERE user_id = ?', [userId]);
        if (existingVote.length > 0) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        await db.promise().query('INSERT INTO votes (user_id, candidate) VALUES (?, ?)', [userId, candidate]);
        res.json({ message: 'Vote cast successfully' });
    } catch (err) {
        console.error('Voting error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Results Endpoint
app.get('/api/results', async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT candidate, COUNT(*) as vote_count FROM votes GROUP BY candidate'
        );
        res.json(results);
    } catch (err) {
        console.error('Results error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Feedback Endpoint
app.post('/api/feedback', async (req, res) => {
    const { userId, name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    try {
        await db.promise().query(
            'INSERT INTO feedback (user_id, name, email, message) VALUES (?, ?, ?, ?)',
            [userId, name, email, message]
        );
        res.json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        console.error('Feedback error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password Endpoint
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await db.promise().query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err.stack);
    res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    db.end(err => {
        if (err) console.error('Error closing database connection:', err);
        console.log('Database connection closed');
        process.exit(0);
    });
});