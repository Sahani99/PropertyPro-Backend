// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Create Express application
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // HTTP request logger
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to our backend service!' });
});

// Set port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});