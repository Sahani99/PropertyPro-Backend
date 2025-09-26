// backend/routes/admin/auction.admin.routes.js
const express = require('express');
const router = express.Router();

// Import middlewares for authentication and role checking
const { checkAuth, requireAdmin } = require('../../middleware/auth.middleware'); // Note the path is '../..'

// Import the auction controller functions
const {
    createAuction,
    editAuction,
    cancelAuction,
    getAllAuctions,
    getAuctionDetails,
    // getEligiblePropertiesForAuction
} = require('../../controllers/admin/auction.admin.controller');

// --- Test log to ensure file is loaded ---
console.log('[ROUTES] admin/auction.admin.routes.js: Setting up admin auction routes...');

// All routes in this file will be automatically prefixed with /api/admin/auctions
// because of how it's mounted in admin.routes.js or server.js.

// All routes here should be protected by both checkAuth and requireAdmin middleware.
router.use(checkAuth, requireAdmin);

// @route   POST /api/admin/auctions/
// @desc    Create a new auction for a property
// @access  Private (Admin)
router.post('/', createAuction);

// @route   GET /api/admin/auctions/
// @desc    Get a list of all auction properties (for admin view)
// @access  Private (Admin)
router.get('/', getAllAuctions);

// @route   GET /api/admin/auctions/:auctionId
// @desc    Get detailed information about a specific auction (bids, winner, etc.)
// @access  Private (Admin)
router.get('/:auctionId', getAuctionDetails);

// @route   PUT /api/admin/auctions/:auctionId
// @desc    Edit an existing auction's details (times, prices, status)
// @access  Private (Admin)
router.put('/:auctionId', editAuction);

// @route   DELETE /api/admin/auctions/:auctionId/cancel
// @desc    Cancel an auction (sets its status to ended/cancelled)
// @access  Private (Admin)
// Using DELETE verb for a cancel action is a valid choice, or you could use a PATCH/PUT to update status.
router.delete('/:auctionId/cancel', cancelAuction);

// Example of another potential route
// @route   GET /api/admin/auctions/eligible-properties
// @desc    Get a list of properties that don't have an active auction yet
// @access  Private (Admin)
// router.get('/eligible-properties', getEligiblePropertiesForAuction);


module.exports = router;