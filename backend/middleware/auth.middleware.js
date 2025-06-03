// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // To access process.env.JWT_SECRET

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if the token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token format is invalid (must be Bearer token)' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
        return res.status(401).json({ message: 'No token found after Bearer, authorization denied' });
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
            return res.status(500).json({ message: "Server configuration error. Cannot verify token." });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user; // Add user payload from token to request object
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;