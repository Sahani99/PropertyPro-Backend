// backend/controllers/admin/user.admin.controller.js
const User = require('../../models/User.model');
const mongoose = require('mongoose');

// @desc    Get all users for the admin dashboard
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('ADMIN CONTROLLER ERROR: Error getting all users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Get a single user by ID
// @route   GET /api/admin/users/:userId
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (error) {
        console.error(`Error fetching user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error while fetching user.' });
    }
};


// @desc    Update a user's details (e.g., name, role)
// @route   PUT /api/admin/users/:userId
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role } = req.body;

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if they are provided
        if (name) userToUpdate.name = name;
        if (email) userToUpdate.email = email;
        if (role && ['admin', 'registered'].includes(role)) { // Validate role
             // Prevent making the last admin a non-admin
            if (userToUpdate.role === 'admin') {
                const adminCount = await User.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    return res.status(400).json({ message: "Cannot change the role of the last admin account." });
                }
            }
            userToUpdate.role = role;
        }

        const updatedUser = await userToUpdate.save();
        const userToReturn = updatedUser.toObject();
        delete userToReturn.password;

        res.json({ message: 'User updated successfully', user: userToReturn });
    } catch (error) {
        console.error(`Error updating user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error while updating user.' });
    }
};

// @desc    Update a user's active status
// @route   PATCH /api/admin/users/:userId/status
exports.updateUserStatus = async (req, res) => {
  const { active } = req.body;
  const { userId } = req.params;
  const loggedInAdminId = req.loggedInUser.id;

  if (userId === loggedInAdminId) {
    return res.status(403).json({ message: "You cannot change the status of your own account." });
  }
  if (typeof active !== 'boolean') {
    return res.status(400).json({ message: "Invalid 'active' status provided." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
        return res.status(403).json({ message: "Admin accounts cannot be deactivated." });
    }

    user.active = active;
    await user.save();

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.json({
        message: `User status updated to ${active ? 'Active' : 'Inactive'}.`,
        user: userToReturn
    });
  } catch (err) {
    console.error(`Error updating status for user ${userId}:`, err);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:userId
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInAdminId = req.loggedInUser.id;

        if (userId === loggedInAdminId) {
            return res.status(403).json({ message: "You cannot delete your own account." });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admin accounts cannot be deleted." });
        }

        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(`Error deleting user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};