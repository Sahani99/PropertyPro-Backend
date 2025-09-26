// backend/routes/user.admin.routes.js
const express = require('express');
const router = express.Router();

const userAdminController = require('../controllers/user.admin.controller'); // Import the controller object
const { checkAuth, requireAdmin } = require('../middleware/auth.middleware');

console.log('[ROUTES user.admin.routes.js] Loaded.');
console.log('  userAdminController.getAllUsers type:', typeof userAdminController.getAllUsers);
console.log('  userAdminController.getUserById type:', typeof userAdminController.getUserById);
// Add logs for other controller functions as needed

// Route that needs explicit middleware because it's before router.use()
// or if you want to be explicit for each.
router.get('/', checkAuth, requireAdmin, userAdminController.getAllUsers);

// Apply common middleware to all subsequent routes in this file
router.use(checkAuth);    // Ensure user is authenticated
router.use(requireAdmin); // Ensure the authenticated user is an admin

// These routes will now automatically have checkAuth and requireAdmin applied
router.get('/:userId', userAdminController.getUserById);
router.put('/:userId/role', userAdminController.updateUserRole);
router.put('/:userId', userAdminController.updateUserDetails);
router.delete('/:userId', userAdminController.deleteUser);

module.exports = router;