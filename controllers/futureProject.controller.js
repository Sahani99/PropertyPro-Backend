// backend/controllers/public/futureProject.public.controller.js
const FutureApartmentProject = require('../models/FutureApartmentProject.model');
const mongoose = require('mongoose');

// @desc    Get all publicly visible future projects
// @route   GET /api/future-projects
// @access  Public
exports.getAllPublicProjects = async (req, res) => {
  try {
    // You could add a filter here, e.g., { isPublic: true }
    const projects = await FutureApartmentProject.find().sort({ launchDate: 1 }); // Sort by launch date
    res.json(projects);
  } catch (error) {
    console.error("Error fetching future projects (Public):", error);
    res.status(500).json({ message: 'Error fetching future projects', error: error.message });
  }
};

// @desc    Get a single public project by its ID
// @route   GET /api/future-projects/:projectId
// @access  Public
exports.getPublicProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID format.' });
    }

    const project = await FutureApartmentProject.findById(projectId);
    if (!project) { // Or add a check for !project.isPublic
      return res.status(404).json({ message: 'Future project not found.' });
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project by ID (Public):", error);
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};