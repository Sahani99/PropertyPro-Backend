// backend/routes/futureProject.routes.js
const express = require('express');
const router = express.Router();

// Import the NEW public controllers
const projectPublicController = require('../controllers/futureProject.controller');
const unitPublicController = require('../controllers/apartmentUnit.controller');

// --- PUBLIC ROUTES FOR FUTURE PROJECTS ---

// GET /api/future-projects/ -> List all public projects
router.get('/', projectPublicController.getAllPublicProjects);

// GET /api/future-projects/:projectId -> Get details of one public project
router.get('/:projectId', projectPublicController.getPublicProjectById);

// GET /api/future-projects/:projectId/units -> Get all public units for a project
router.get('/:projectId/units', unitPublicController.getUnitsForProject);

module.exports = router;