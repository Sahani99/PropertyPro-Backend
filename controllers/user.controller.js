// controllers/user.controller.js
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Still needed for login's bcrypt.compare if not using model method
require('dotenv').config();

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body; // Added phone
    console.log("Registration attempt for email:", email);

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be a string and at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Create new user instance with plain password; model hook will hash it
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: password, // Pass plain text password
      role: role || 'registered',
      phone: phone || undefined // Include phone if provided
    });

    await newUser.save(); // Pre-save hook in User.model.js will hash the password

    // Create JWT (payload should not contain password)
    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };
//     const payload = {
//   user: { // Nested 'user' object
//     id: someUserId,
//     email: someUserEmail,
//     name: someUserName,
//     role: someUserRole
//   }
// };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Don't send password back, even hashed
    const userToReturn = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
    };

    res.status(201).json({
      message: 'User registered successfully!',
      token, // Send token so user is logged in immediately
      user: userToReturn
    });

  } catch (err) {
    console.error("Error in registerUser:", err.stack); // Log full stack for better debugging
    // Check for Mongoose duplicate key error for email (though findOne should catch it)
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: err.message || "Server error during registration." });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // ... (validation) ...
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Generic message
    }
    // Prevent login if user is deactivated
    if (!user.active) {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact support.' });
    }
    // Use the model method if you defined it, otherwise use bcrypt directly
    // const isMatch = await user.matchPassword(password); // If using model method
    const isMatch = await bcrypt.compare(password, user.password); // Direct bcrypt compare
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Generic message
    }
    // ... (JWT creation and response as you have it) ...
    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const JWT_SECRET = process.env.JWT_SECRET;
    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        const { password: _, ...userData } = user.toObject();
        res.json({ message: 'Login successful!', token, user: userData });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || 'Server error during login.' });
  }
};

// ... getMe and getAllUsers ...
// Ensure exports.getMe = async (req, res) => { ... }; is correctly defined (no duplicate export lines)
exports.getMe = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authenticated or user ID missing in token.' });
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ user: user.toObject() });
    } catch (error) {
        res.status(500).json({ message: "Server error fetching user profile." });
    }
};

// Get all users (example, protect this appropriately, e.g., admin only)
exports.getAllUsers = async (req, res) => {
  // Example: Check if the logged-in user is an admin
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ message: "Access denied. Admin role required." });
  // }
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: err.message || "Server error fetching users." });
  }
};

// PATCH /users/:id/status - Activate or deactivate a user
exports.patchUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'Active status must be a boolean.' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { active },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: `User has been ${active ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ message: err.message || 'Server error updating user status.' });
  }
};