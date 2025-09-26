// backend/routes/property.routes.js
const express = require('express');
const router = express.Router();

// This file should ONLY handle PUBLIC-FACING property logic.
// It should import from a controller that handles public logic.
const propertyController = require('../controllers/property.controller');

// --- Test log ---
console.log('[ROUTES] property.routes.js: File loaded.');

// @route   GET /api/properties
// @desc    Get all publicly available properties (with filtering)
// @access  Public
router.get('/', propertyController.getAllProperties);

// @route   GET /api/properties/:id
// @desc    Get a single property by its ID
// @access  Public
router.get('/:id', propertyController.getPropertyById);

module.exports = router;