const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Include body-parser
const mysql = require('mysql2'); // Include mysql2 package

const app = express();
const port = 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from Frontend-AutoFix folder
app.use(express.static(path.join(__dirname, '../Frontend-AutoFix')));

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password', // Replace with your MySQL root password
    database: 'autofix_db'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Handle root request ("/")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend-AutoFix/index.html'));
});

// Example API endpoint
app.get('/api/data', (req, res) => {
    res.json({ message: 'This is some data from the server' });
});

// Handle form submission
app.post('/api/submit', (req, res) => {
    const formData = req.body; // Get form data
    console.log('Form data received:', formData);
    res.json({ message: 'Form submitted successfully' });
});

// Sign-up logic: Insert user into the database
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).json({ message: 'Error signing up user' });
        } else {
            console.log('User signed up successfully:', result);
            res.json({ message: 'User signed up successfully' });
        }
    });
});

// Login logic: Validate user credentials
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ message: 'Error logging in' });
        } else if (results.length > 0) {
            console.log('Login successful:', results[0]);
            res.json({ message: 'Login successful', user: results[0] });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
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
