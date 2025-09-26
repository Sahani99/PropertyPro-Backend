// backend/controllers/auction.controller.js - CORRECTED VERSION

const Property = require('../models/Property.model');
const mongoose = require('mongoose');
const { isBefore, isAfter } = require('date-fns');

// --- PUBLIC / USER-FACING FUNCTIONS ---

// @desc    Get all active or upcoming public auctions
// @route   GET /api/auctions
const getAllPublicAuctions = async (req, res) => {
  try {
    // THIS IS THE FIX: The query now correctly looks for the capitalized statuses
    // 'Live' and 'Upcoming' to match what's in your database.
    const publicAuctions = await Property.find({
      'auction.status': { $in: ['Live', 'Upcoming'] }
    })
    .sort({ 'auction.startTime': 1 });

    // Add headers to prevent browser caching for this dynamic route.
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log(`[API LOG] Found ${publicAuctions.length} public auctions.`);
    res.json(publicAuctions);

  } catch (err) {
    console.error("Error fetching public auctions:", err);
    res.status(500).json({ message: 'Error fetching auctions.' });
  }
};

// @desc    Get details for a single public auction
// @route   GET /api/auctions/:auctionId
const getAuctionDetails = async (req, res) => {
    try {
        const { auctionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ message: 'Invalid Auction ID format.' });
        }

        const property = await Property.findById(auctionId)
            .populate('auction.bids.user', 'name email')
            .populate('auction.winner', 'name email');

        if (!property || !property.auction) {
            return res.status(404).json({ message: 'Auction not found.' });
        }
        res.json(property);
    } catch (err) {
        console.error("Error in getAuctionDetails:", err);
        res.status(500).json({ message: 'Error fetching auction details.' });
    }
};

// @desc    Place a bid on an auction property
// @route   POST /api/auctions/:propertyId/bids
const placeBid = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { amount } = req.body;
        const userId = req.loggedInUser._id; // Assuming checkAuth middleware provides this

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'A valid bid amount is required.' });
        }

        const property = await Property.findById(propertyId);
        if (!property || !property.auction) {
            return res.status(404).json({ message: 'Auction property not found.' });
        }

        const now = new Date();
        const start = new Date(property.auction.startTime);
        const end = new Date(property.auction.endTime);

        // THIS IS THE SECOND FIX: Check against the correct 'Live' status.
        if (isBefore(now, start) || isAfter(now, end) || property.auction.status !== 'Live') {
            return res.status(400).json({ message: 'Auction is not currently live for bidding.' });
        }

        if (amount <= property.auction.currentBid) {
            return res.status(400).json({ message: `Bid must be higher than the current bid.` });
        }

        property.auction.bids.push({ user: userId, amount: Number(amount), createdAt: new Date() });
        property.auction.currentBid = Number(amount);
        
        const updatedProperty = await property.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('bidUpdate', { 
                propertyId: updatedProperty._id, 
                updatedAuction: updatedProperty.auction 
            });
        }

        res.status(200).json({ message: 'Bid placed successfully.', property: updatedProperty });
    } catch (error) {
        console.error("Error in placeBid:", error);
        res.status(500).json({ message: 'Server error while placing bid.' });
    }
};

module.exports = {
    getAllPublicAuctions,
    getAuctionDetails,
    placeBid,
};