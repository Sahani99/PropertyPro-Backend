// backend/controllers/user.admin.controller.js
const User = require('../models/User.model');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('ADMIN CONTROLLER ERROR: Error getting all users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// --- FIX: ADD THIS ENTIRE NEW FUNCTION ---
exports.updateUserStatus = async (req, res) => {
  const { active } = req.body;
  const userIdToUpdate = req.params.userId;
  const loggedInAdminId = req.loggedInUser.id; // From auth middleware

  // Security Check: Prevent an admin from changing their own status.
  if (userIdToUpdate === loggedInAdminId) {
    return res.status(403).json({ message: "You cannot change the status of your own account." });
  }

  if (typeof active !== 'boolean') {
    return res.status(400).json({ message: "Invalid 'active' status provided." });
  }

  try {
    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.active = active;
    await user.save();

    res.json({ message: `User status updated to ${active ? 'Active' : 'Inactive'}.` });
  } catch (err) {
    console.error(`Error updating status for user ${userIdToUpdate}:`, err);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
};
// --- END OF FIX ---


// The rest of your functions remain the same
exports.getUserById = async (req, res) => { /* your existing code */ };
exports.updateUserRole = async (req, res) => { /* your existing code */ };
exports.updateUserDetails = async (req, res) => { /* your existing code */ };
exports.deleteUser = async (req, res) => { /* your existing code */ };