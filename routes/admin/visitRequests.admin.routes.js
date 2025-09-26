// backend/routes/admin/visitRequests.admin.routes.js
const express = require('express');
const router = express.Router();

// Import middlewares
const { checkAuth, requireAdmin } = require('../../middleware/auth.middleware');

// Correct path to your controller
const {
    getAllVisitRequestsForAdmin,
    updateVisitRequestStatus
} = require('../../controllers/admin/visitRequest.admin.controller');

// Apply auth middleware to all routes in this file
router.use(checkAuth, requireAdmin);

// GET /api/admin/visit-requests/
router.get('/', getAllVisitRequestsForAdmin);

// PATCH /api/admin/visit-requests/:id
router.patch('/:id', updateVisitRequestStatus);

module.exports = router;


