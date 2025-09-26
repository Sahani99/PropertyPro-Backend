// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();

// --- Import Controller ---
const userController = require('../controllers/user.controller');
console.log('[ROUTES] user.routes.js: Imported userController:', userController);
// Check specific controller functions needed for this file
console.log('[ROUTES] user.routes.js: typeof userController.registerUser:', typeof userController.registerUser);
console.log('[ROUTES] user.routes.js: typeof userController.loginUser:', typeof userController.loginUser);
console.log('[ROUTES] user.routes.js: typeof userController.getMe:', typeof userController.getMe);
console.log('[ROUTES] user.routes.js: typeof userController.getAllUsers:', typeof userController.getAllUsers);


// --- Import Middleware ---
// Option A: If auth.middleware.js exports an object { checkAuth, requireAdmin }
const authMiddlewareObject = require('../middleware/auth.middleware');
console.log('[ROUTES] user.routes.js: Imported authMiddlewareObject:', authMiddlewareObject);
const checkAuthFunction = authMiddlewareObject.checkAuth; // Explicitly get the function
console.log('[ROUTES] user.routes.js: typeof checkAuthFunction to be used:', typeof checkAuthFunction);
// const requireAdminFunction = authMiddlewareObject.requireAdmin; // If needed

// Option B: Direct destructuring (preferred if export is an object)
// const { checkAuth, requireAdmin } = require('../middleware/auth.middleware');
// console.log('[ROUTES] user.routes.js: typeof checkAuth (destructured):', typeof checkAuth);
// console.log('[ROUTES] user.routes.js: typeof requireAdmin (destructured):', typeof requireAdmin);


// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes (require a valid token)
// THIS IS LIKELY YOUR LINE 12 (or around there after adding logs)
router.get('/me', checkAuthFunction, userController.getMe); // Use the explicitly defined checkAuthFunction
router.get('/all', checkAuthFunction, userController.getAllUsers);

// PATCH /users/:id/status - Activate or deactivate a user
router.patch('/:id/status', checkAuthFunction, userController.patchUserStatus);

module.exports = router;