const express = require('express');
const router = express.Router();

// Import middleware
const { checkAuth } = require('../middleware/auth.middleware');

// Import profile controller functions
const {
    updateMyProfile,
    changeMyPassword,
    getMyVisitRequests,
    getMyBids,
    getMyWins
} = require('../controllers/profile.controller');

// All routes in this file are for authenticated users, so apply checkAuth to all.
router.use(checkAuth);

// @route   PUT /api/profile/me
router.put('/me', updateMyProfile);

// @route   PUT /api/profile/change-password
router.put('/change-password', changeMyPassword);

// @route   GET /api/profile/my-visit-requests
router.get('/my-visit-requests', getMyVisitRequests);

// @route   GET /api/profile/my-bids
router.get('/my-bids', getMyBids);

// @route   GET /api/profile/my-wins
router.get('/my-wins', getMyWins);

module.exports = router;