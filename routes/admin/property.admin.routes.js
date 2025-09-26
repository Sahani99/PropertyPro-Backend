// backend/routes/admin/property.admin.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../../middleware/multerImageUpload'); // Your multer middleware
// Import the specific admin controller for properties
const propertyAdminController = require('../../controllers/admin/property.admin.controller');
// The main admin.routes.js hub already applies checkAuth and requireAdmin, so we don't need them here.
// @route POST /api/admin/properties
// @desc Create a new property
router.post('/', upload.array('imageFiles', 10), propertyAdminController.createProperty);
// @route PUT /api/admin/properties/:id
// @desc Update a property
router.put('/:id', upload.array('imageFiles', 10), propertyAdminController.updateProperty);
// @route DELETE /api/admin/properties/:id
// @desc Delete a property
router.delete('/:id', propertyAdminController.deleteProperty);
// You can also have a GET route for admins to see ALL properties, including 'sold' or 'pending' ones
router.get('/', propertyAdminController.getAllPropertiesAdmin);
router.get('/:id', propertyAdminController.getPropertyByIdAdmin); // For the edit form
module.exports = router;