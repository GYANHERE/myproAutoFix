const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from Frontend-AutoFix folder
app.use(express.static(path.join(__dirname, '../Frontend-AutoFix')));

// Handle root request ("/")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend-AutoFix/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
