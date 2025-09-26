// const express = require('express');
// const router = express.Router();
// const { getAllAuctions, createAuction, editAuction, cancelAuction, getAuctionDetails } = require('../controllers/auction.controller');
// const { requireAdmin, checkAuth } = require('../middleware/auth.middleware');

// // Get all auctions
// router.get('/', checkAuth, requireAdmin, getAllAuctions);
// // Create new auction
// router.post('/', checkAuth, requireAdmin, createAuction);
// // Edit auction
// router.patch('/:auctionId', checkAuth, requireAdmin, editAuction);
// // Cancel auction
// router.delete('/:auctionId', checkAuth, requireAdmin, cancelAuction);
// // Get auction details (winner, bid history)
// router.get('/:auctionId', checkAuth, requireAdmin, getAuctionDetails);

// module.exports = router;