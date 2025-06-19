// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware'); // Correct path to your middleware

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes (require a valid token)
router.get('/me', authMiddleware, userController.getMe);
router.get('/all', authMiddleware, userController.getAllUsers); // Example: Get all users, protected

module.exports = router;
