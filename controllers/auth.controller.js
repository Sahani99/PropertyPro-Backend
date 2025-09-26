// backend/controllers/auth.controller.js
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// --- Register User ---
const registerUser = async (req, res) => {
    console.log("[CONTROLLER auth.controller.js] registerUser function has been called.");
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password, // Plain text; hashed via model pre-save hook
            role: role || 'registered',
            phone: phone || undefined
        });

        await newUser.save();
        console.log(`[CONTROLLER auth.controller.js] User ${newUser.email} registered and saved.`);

        const payload = {
            user: {
                id: newUser._id.toString(),
                role: newUser.role,
                email: newUser.email
            }
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        const userToReturn = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            active: newUser.active
        };

        return res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: userToReturn
        });

    } catch (err) {
        console.error("[CONTROLLER auth.controller.js] Registration Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists." });
        }
        return res.status(500).json({ message: "Server error during registration." });
    }
};

// --- Login User ---
const loginUser = async (req, res) => {
    console.log("[CONTROLLER auth.controller.js] loginUser function has been called.");
    const { email, password } = req.body;
    console.log(`[CTRL auth] Login attempt for: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (!user.active) {
            console.log(`[CTRL auth] Login FAILED for ${email}: Account is deactivated.`);
            return res.status(403).json({
                message: 'Your account has been deactivated. Please contact an administrator.'
            });
        }

        const payload = {
            user: {
                id: user._id.toString(),
                role: user.role,
                email: user.email
            }
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        const userToReturn = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            active: user.active
        };

        return res.json({
            message: 'Login successful!',
            token,
            user: userToReturn
        });

    } catch (err) {
        console.error("[CTRL auth login] Error:", err.stack);
        return res.status(500).json({ message: err.message || 'Server error during login.' });
    }
};

// --- Get Current User ---
const getMe = async (req, res) => {
    console.log("[CONTROLLER auth.controller.js] getMe function has been called.");
    if (!req.loggedInUser) {
        return res.status(401).json({ message: 'Not authenticated properly (user data missing).' });
    }
    return res.json({ user: req.loggedInUser });
};

// --- Update Profile ---
const updateMyProfile = async (req, res) => {
    console.log("[CONTROLLER auth.controller.js] updateMyProfile function has been called.");
    try {
        const user = await User.findById(req.loggedInUser.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;

        const updatedUser = await user.save();

        const userToReturn = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone
        };

        res.json({ message: 'Profile updated successfully.', user: userToReturn });
    } catch (error) {
        console.error("Error in updateMyProfile:", error);
        res.status(500).json({ message: "Server error while updating profile." });
    }
};

// --- Export Controllers ---
module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateMyProfile
};