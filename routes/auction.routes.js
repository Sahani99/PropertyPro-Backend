const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth.middleware');

// --- Import the CORRECT controller ---
const auctionController = require('../controllers/auction.controller');

// --- PUBLIC AUCTION ROUTES ---

// GET /api/auctions/ -> This should get a list of public auctions.
router.get('/', auctionController.getAllPublicAuctions); // Use the clearly named public function

// GET /api/auctions/:auctionId -> This should get the details of one auction.
router.get('/:auctionId', auctionController.getAuctionDetails);

// --- AUTHENTICATED USER ACTIONS ---

// POST /api/auctions/:propertyId/bids - Place a bid on an auction
// Note: Changed ':id' to ':propertyId' to match controller for clarity
router.post('/:propertyId/bids', checkAuth, auctionController.placeBid);

module.exports = router;