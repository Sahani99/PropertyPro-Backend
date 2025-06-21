// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- IMPORT ROUTE FILES ---
const propertyRoutes = require('./routes/property.routes'); // Assuming you have this
const userRoutes = require('./routes/user.routes');
//const authRoutes = require('./routes/auth.routes'); // We'll create this for clarity

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow requests from your Vite dev server
    credentials: true
}));
app.use(express.json()); // To parse JSON request bodies

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// --- API ROUTES ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Real Estate API!' });
});

// It's often good practice to have a dedicated /api/auth route for login/register
// but given your current user.routes.js, we'll stick to /api/users for login/register
// and add /api/auth for /me if we make auth.routes.js

app.use('/api/properties', propertyRoutes); // Assuming this exists
app.use('/api/users', userRoutes);  
      // For register, login (as per your original user.routes) and potentially all users
// If you want a separate /auth for /me:
// app.use('/api/auth', authRoutes); // For /me route

// --- Error Handling Middleware (Optional but good practice) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Start the Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
