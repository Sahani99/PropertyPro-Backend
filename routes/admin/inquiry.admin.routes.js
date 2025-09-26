const express = require('express');
const router = express.Router();
const { checkAuth, requireAdmin } = require('../../middleware/auth.middleware');
const inquiryController = require('../../controllers/inquiry.controller'); // Assuming a dedicated controller

router.use(checkAuth, requireAdmin);

// GET /api/admin/inquiries/ - Get all submitted inquiries
router.get('/', inquiryController.getAllInquiries);

// DELETE /api/admin/inquiries/:inquiryId - Delete an inquiry after it has been handled
router.delete('/:inquiryId', inquiryController.deleteInquiry);

module.exports = router;