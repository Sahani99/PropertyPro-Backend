// backend/controllers/public/apartmentUnit.public.controller.js
const ApartmentUnit = require('../models/ApartmentUnit.model');
const mongoose = require('mongoose');

// @desc    Get all public-facing units for a specific project
// @route   GET /api/future-projects/:projectId/units
// @access  Public
exports.getUnitsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID format.' });
    }

    const units = await ApartmentUnit.find({ projectId: projectId }).sort({ unitNumber: 1 });
    res.json(units);
  } catch (error) {
    console.error("Error fetching units for project (Public):", error);
    res.status(500).json({ message: 'Error fetching units', error: error.message });
  }
};