// backend/routes/admin/user.admin.routes.js
const express = require('express');
const router = express.Router();

// Import the controller functions we defined
const {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser
} = require('../../controllers/admin/user.admin.controller');

// Note: Security (checkAuth, requireAdmin) is applied in the main `admin.routes.js` hub,
// so we don't need to add it to every route here.

// @route   GET /api/admin/users/
// @desc    Get a list of all users
router.get('/', getAllUsers);

// @route   GET /api/admin/users/:userId
// @desc    Get details of a single user
router.get('/:userId', getUserById);

// @route   PUT /api/admin/users/:userId
// @desc    Update a user's details (name, email, role)
router.put('/:userId', updateUser);

// @route   PATCH /api/admin/users/:userId/status
// @desc    Update a user's active status
router.patch('/:userId/status', updateUserStatus);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
router.delete('/:userId', deleteUser);

module.exports = router;