// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const Property = require('../models/propertySchema'); // Adjust path if needed

// @desc    Get one property by ID
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.status(200).json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
