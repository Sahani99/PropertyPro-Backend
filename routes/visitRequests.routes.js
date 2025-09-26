// backend/routes/visitRequests.routes.js
const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth.middleware');
const { createVisitRequest, getMyVisitRequests, cancelMyVisitRequest } = require('../controllers/visitRequest.controller');

console.log('[ROUTES visitRequests.routes.js] Loaded. checkAuth defined:', !!checkAuth, 'createVisitRequest defined:', !!createVisitRequest);

// POST /api/visit-requests (User creates a request)
router.post('/', checkAuth, createVisitRequest);
// GET /api/visit-requests/my-requests - Get history of my requests
router.get('/my-requests', checkAuth, getMyVisitRequests);
// PATCH /api/visit-requests/:requestId/cancel - Cancel my pending request 
router.patch('/:requestId/cancel', checkAuth, cancelMyVisitRequest);

module.exports = router;