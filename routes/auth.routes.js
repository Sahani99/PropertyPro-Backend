// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();

// Import the entire controller object
const authController = require('../controllers/auth.controller');
// Import the middleware
const { checkAuth } = require('../middleware/auth.middleware');

// --- Diagnostic Logs ---
console.log('[ROUTES auth.routes.js] File loaded.');
console.log('[ROUTES auth.routes.js] Imported authController object:', authController);
console.log('[ROUTES auth.routes.js] Type of authController.registerUser:', typeof authController.registerUser);
console.log('[ROUTES auth.routes.js] Type of authController.loginUser:', typeof authController.loginUser);
console.log('[ROUTES auth.routes.js] Type of authController.getMe:', typeof authController.getMe);
console.log('[ROUTES auth.routes.js] Type of authController.updateMyProfile:', typeof authController.updateMyProfile);
// --- End Diagnostic Logs ---


// Public routes
router.post('/register', authController.registerUser); // This is likely your line 9
router.post('/login', authController.loginUser);

// Profile Routes for the Logged-in User
router.get('/me', checkAuth, authController.getMe);
router.put('/me', checkAuth, authController.updateMyProfile);

module.exports = router;