// backend/routes/apartmentUnit.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // Use mergeParams to access :projectId from parent router

// Example route: GET all units for a specific project
// Path would be GET /api/future-projects/:projectId/units/
router.get('/', (req, res) => {
    const { projectId } = req.params;
    res.json({ message: `TODO: Get all apartment units for project ID: ${projectId}` });
});

// Example route: GET a specific unit within a project
// Path would be GET /api/future-projects/:projectId/units/:unitId
router.get('/:unitId', (req, res) => {
    const { projectId, unitId } = req.params;
    res.json({ message: `TODO: Get details for unit ${unitId} in project ${projectId}` });
});

module.exports = router;