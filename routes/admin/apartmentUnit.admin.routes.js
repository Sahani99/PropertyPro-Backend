// backend/routes/admin/apartmentUnit.admin.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // CRUCIAL for accessing :projectId
const upload = require('../../middleware/multerImageUpload');
const unitAdminController = require('../../controllers/admin/apartmentUnit.admin.controller');

// Note: Security middleware (checkAuth, requireAdmin) is applied in the parent admin.routes.js hub

// POST /api/admin/future-projects/:projectId/units/
router.post('/', unitAdminController.createUnit);

// PUT /api/admin/future-projects/:projectId/units/:unitId
router.put('/:unitId', unitAdminController.updateUnit);

// DELETE /api/admin/future-projects/:projectId/units/:unitId
router.delete('/:unitId', unitAdminController.deleteUnit);

// POST /api/admin/future-projects/:projectId/units/:unitId/floorplan
router.post(
    '/:unitId/upload-floorplan',
    upload.single('floorPlanImage'),
    unitAdminController.uploadFloorPlanImage
);

module.exports = router;