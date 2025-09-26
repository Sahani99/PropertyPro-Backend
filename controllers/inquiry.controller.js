// backend/controllers/inquiry.controller.js
const Inquiry = require('../models/Inquiry.model');

// @desc    Create a new inquiry or pre-registration
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = async (req, res) => {
    const { name, email, phone, message, subject } = req.body;

    // Basic validation
    if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Name, email, and phone are required.' });
    }
    // You could add more validation here, like for email format

    try {
        const newInquiry = new Inquiry({
            name,
            email,
            phone,
            message: message || '',
            subject: subject || 'General Inquiry' // e.g., 'Future Project Pre-registration'
        });

        await newInquiry.save();

        // TODO: Implement email notification to admin
        console.log(`New inquiry received from ${email}`);
        res.status(201).json({ message: 'Thank you for your inquiry! We will be in touch shortly.' });

    } catch (error) {
        console.error('Error saving inquiry:', error);
        res.status(500).json({ message: 'Server error while submitting your inquiry.' });
    }
};