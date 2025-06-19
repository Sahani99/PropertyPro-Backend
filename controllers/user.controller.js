// controllers/user.controller.js
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // To access process.env.JWT_SECRET

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Registration attempt for email:", email);

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (typeof password !== 'string' || password.length < 6) { // Basic password length validation
      return res.status(400).json({ message: 'Password must be a string and at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use. Please login or use a different email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'registered' // Default role if not provided
    });

    await newUser.save();

    // Don't send password back, even hashed
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: 'User registered successfully!',
      user: userWithoutPassword
    });

  } catch (err) {
    console.error("Error in registerUser:", err);
    res.status(500).json({ message: err.message || "Server error during registration." });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);


    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Login failed. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Login failed. Invalid credentials.' });
    }

    // User matched, create JWT
    const payload = {
      user: {
        id: user.id, // or user._id
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
        return res.status(500).json({ message: "Server configuration error. Cannot sign token." });
    }

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour (e.g., '1h', '7d')
      (err, token) => {
        if (err) {
            console.error("Error signing token:", err);
            return res.status(500).json({ message: "Error generating authentication token."});
        }

        // Exclude password from user object returned to frontend
        const { password: _, ...userData } = user.toObject();

        res.json({
          message: 'Login successful!',
          token,
          user: userData // AuthContext expects this structure
        });
      }
    );

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || 'Server error during login.' });
  }
};

// Get current logged-in user's profile (requires auth middleware)
exports.getMe = async (req, res) => {
    // controllers/user.controller.js
// ... other controller functions ...

// Get current logged-in user's profile (requires auth middleware)
exports.getMe = async (req, res) => {
    // req.user is populated by the authMiddleware
    // req.user should contain { id: 'someUserId', email: '...', name: '...', role: '...' }
    if (!req.user || !req.user.id) {
        console.error("getMe: Not authenticated or user ID missing in token payload from authMiddleware. req.user:", req.user);
        return res.status(401).json({ message: 'Not authenticated or user ID missing in token.' });
    }

    try {
        // Fetch fresh user data from the database using the ID from the token
        // .select('-password') ensures the hashed password is not sent back
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            // This could happen if the token is valid but the user has been deleted from the DB
            console.warn("getMe: User not found in DB for ID:", req.user.id, "(token valid but user deleted?).");
            return res.status(404).json({ message: 'User not found.' });
        }

        // The frontend AuthContext expects an object with a 'user' key,
        // or just the user data directly. Your current frontend code handles both:
        // setUser(response.data.user || response.data);
        // So, sending { user: user } is consistent.
        console.log("getMe: Successfully fetched user profile for ID:", req.user.id);
        res.json({ user: user.toObject() }); // Send as { user: userData }
                                         // .toObject() is good practice for Mongoose docs before sending

    } catch (error) {
        console.error("Error in getMe controller for user ID:", req.user.id, "Error:", error);
        res.status(500).json({ message: "Server error fetching user profile." });
    }
};

// ... other controller functions ...
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