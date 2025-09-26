// const express = require('express');
// const router = express.Router();
// const { checkAuth, requireAdmin } = require('../middleware/auth.middleware'); // Comment out for now
// const {
//     getAllVisitRequestsForAdmin,
//     updateVisitRequestStatus
// } = require('../controllers/visitRequest.controller');

// console.log('[ROUTES] visitRequests.admin.routes.js loaded.');
// // console.log('  checkAuth is function?', typeof checkAuth === 'function'); // Will be undefined now
// // console.log('  requireAdmin is function?', typeof requireAdmin === 'function'); // Will be undefined now
// console.log('  getAllVisitRequestsForAdmin is function?', typeof getAllVisitRequestsForAdmin === 'function');
// console.log('  updateVisitRequestStatus is function?', typeof updateVisitRequestStatus === 'function');

// // Mounted at /api/admin by server.js

// // Handles GET /api/admin/visit-requests
// // router.get('/visit-requests', checkAuth, requireAdmin, getAllVisitRequestsForAdmin); // Original
// router.get('/visit-requests', checkAuth, requireAdmin, getAllVisitRequestsForAdmin);
// // Handles PATCH /api/admin/visit-requests/:id
// // router.patch('/visit-requests/:id', checkAuth, requireAdmin, updateVisitRequestStatus); // Original
// router.patch('/visit-requests/:id', checkAuth, requireAdmin, updateVisitRequestStatus); // <<<< RE-ADD MIDDLEWARE

// module.exports = router;

// backend/routes/visitRequests.admin.routes.js
const express = require('express');
const router = express.Router();
const { checkAuth, requireAdmin } = require('../middleware/auth.middleware');
const {
    getAllVisitRequestsForAdmin,
    updateVisitRequestStatus
} = require('../controllers/visitRequest.controller');

console.log('[ROUTES visitRequests.admin.routes.js] Loaded.');

// Mounted at /api/admin/visit-requests in server.js (example)
// So, this handles GET /api/admin/visit-requests
router.get('/', checkAuth, requireAdmin, getAllVisitRequestsForAdmin);

// And this handles PATCH /api/admin/visit-requests/:id
router.patch('/:id', checkAuth, requireAdmin, updateVisitRequestStatus);

module.exports = router;