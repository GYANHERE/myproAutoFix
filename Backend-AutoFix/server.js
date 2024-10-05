const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the Frontend-AutoFix directory
app.use(express.static(path.join(__dirname, '../Frontend-AutoFix')));

// MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'happy@1807@@@@', // Your actual password
    database: process.env.DB_NAME || 'autofix_db'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
        
        // Test the connection with a simple query
        db.query('SELECT 1 + 1 AS solution', (error, results) => {
            if (error) throw error;
            console.log('The solution is: ', results[0].solution); // Should log "The solution is: 2"
        });
    }
});

// Serve the user dashboard page
app.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend-AutoFix/user-dashboard.html'));
});

// Serve the index page (root request)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend-AutoFix/index.html'));
});

// Sign-up logic: Insert user into the database
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Step 1: Check if the user already exists
    const checkUserSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserSql, [email], (err, results) => {
        if (err) {
            console.error('Error checking for existing user:', err);
            return res.status(500).json({ message: 'Error signing up user' });
        }
        if (results.length > 0) {
            // If results are found, it means the email is already in use
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Step 2: Hash the password if the email does not exist
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Error signing up user' });
            }

            // Step 3: Insert the new user into the database
            const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
            db.query(sql, [username, email, hash], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ message: 'Error signing up user' });
                }
                console.log('User signed up successfully:', result);
                res.json({ message: 'User signed up successfully' });
            });
        });
    });
});

// Login logic: Validate user credentials
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).json({ message: 'Error logging in' });
        }
        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password_hash, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ message: 'Error logging in' });
                }
                if (isMatch) {
                    console.log('Login successful:', user);
                    return res.json({ message: 'Login successful', user });
                }
                return res.status(401).json({ message: 'Invalid credentials' });
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
