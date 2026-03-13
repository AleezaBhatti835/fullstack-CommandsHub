// 1. Import the tools we installed
const express = require('express');
const cors = require('cors');

// 2. Import your data file
const commandsData = require('./commandsData.json');

// 3. Start the Express app
const app = express();
app.use(cors()); // Allows your Vite app to securely request this data
app.use(express.json()); // Allows the server to understand JSON format

// 4. Create your first API Endpoint!
// When someone visits this URL, send them the JSON data
app.get('/api/commands', (req, res) => {
    res.json(commandsData);
});

// 5. Turn the server on
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});