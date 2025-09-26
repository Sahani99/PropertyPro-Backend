// backend/routes/admin/futureProject.admin.routes.js
const express = require('express');
const router = express.Router();

const {
    createProject,
    updateProject,
    deleteProject,
    generateCloudinarySignature
} = require('../../controllers/admin/futureProject.admin.controller');

const apartmentUnitAdminRoutes = require('./apartmentUnit.admin.routes');

// Route order is important

// Get signature for signed uploads (specific string)
router.post('/cloudinary-signature', generateCloudinarySignature);

// Create a new project
router.post('/', createProject);

// Delegate to nested unit routes
router.use('/:projectId/units', apartmentUnitAdminRoutes);

// Routes with dynamic :projectId parameter
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);
// You might also need a GET /:projectId for the admin view

module.exports = router;