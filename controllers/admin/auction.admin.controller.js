const Property = require('../../models/Property.model');
const mongoose = require('mongoose');
const { emitAuctionStatus } = require('../../sockets/auction.socket'); 

// --- CONTROLLER FUNCTIONS ---

// @desc    Get all auctions for the admin dashboard
// @route   GET /api/admin/auctions
// exports.getAllAuctions = async (req, res) => {
//     console.log("[ADMIN AUCTION CTRL] GET /api/admin/auctions called");
//     try {
//         const now = new Date();
//         const propertiesWithAuctions = await Property.find({
//             'auction': { $exists: true, $ne: null }
//         })
//         .populate('auction.winner', 'name email') // It's good to populate winner info
//         .sort({ 'auction.startTime': -1 });

//         // Auto-end auctions whose endTime has passed
//         for (const p of propertiesWithAuctions) {
//             if (!p.auction) continue;
//             const start = new Date(p.auction.startTime);
//             const end = new Date(p.auction.endTime);
//             // End auction if endTime has passed
//             if ((p.auction.status === 'Live' || p.auction.status === 'Upcoming') && end < now) {
//                 p.auction.status = 'Ended';
//                 await p.save();
//             // Set to Live if startTime has passed and status is Upcoming
//             } else if (p.auction.status === 'Upcoming' && start <= now && end > now) {
//                 p.auction.status = 'Live';
//                 await p.save();
//             }
//         }

//         res.json(propertiesWithAuctions);

//     } catch (err) {
//         console.error("Error in admin getAllAuctions:", err.stack);
//         res.status(500).json({ message: 'Error fetching auctions.' });
//     }
// };

exports.getAllAuctions = async (req, res) => {
    try {
        // This function now ONLY fetches data. It no longer modifies it.
        const propertiesWithAuctions = await Property.find({
            'auction': { $exists: true, $ne: null }
        })
        .populate('auction.winner', 'name email')
        .sort({ 'auction.startTime': -1 });

        res.json(propertiesWithAuctions);

    } catch (err) {
        console.error("Error in admin getAllAuctions:", err.stack);
        res.status(500).json({ message: 'Error fetching auctions.' });
    }
};

// @desc    Create a new auction for a property
// @route   POST /api/admin/auctions
// exports.createAuction = async (req, res) => {
//     try {
//         const { propertyId, startTime, endTime, startingPrice, reservePrice } = req.body;
        
//         if (!propertyId || !startTime || !endTime || startingPrice === undefined) {
//             return res.status(400).json({ message: 'Property, start/end times, and starting price are required.' });
//         }

//         const property = await Property.findById(propertyId);
//         if (!property) return res.status(404).json({ message: 'Property not found.' });
//         if (property.auction) return res.status(400).json({ message: 'This property already has an auction configured.' });

//         const now = new Date();
//         const auctionStatus = new Date(startTime) > now ? 'Upcoming' : 'Live';

//         property.auction = {
//             startTime,
//             endTime,
//             startingPrice: Number(startingPrice) || 0,
//             currentBid: Number(startingPrice) || 0,
//             reservePrice: reservePrice ? Number(reservePrice) : 0,
//             status: auctionStatus,
//             bids: [],
//         };
//         await property.save();
//         const scheduleSingleAuction = req.app.get('scheduleSingleAuction');
// scheduleSingleAuction(property); // Schedule the newly created auction

// res.status(201).json({ message: 'Auction created successfully.', property });

//         // Get io from req.app to emit events if you're using sockets
//         // const io = req.app.get('io');
//         // emitAuctionStatus(io, property._id.toString(), auctionStatus, Number(startingPrice));

//         res.status(201).json({ message: 'Auction created successfully.', property });
//     } catch (err) {
//         console.error("Error in createAuction:", err);
//         res.status(500).json({ message: 'Error creating auction.' });
//     }
// };

exports.createAuction = async (req, res) => {
    // 1. Log the incoming data to see exactly what the server received.
    console.log('[createAuction] Received request body:', req.body);

    try {
        const { propertyId, startTime, endTime, startingPrice, reservePrice } = req.body;
        
        if (!propertyId || !startTime || !endTime || startingPrice === undefined) {
            return res.status(400).json({ message: 'Missing required fields (propertyId, startTime, endTime, startingPrice).' });
        }

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ message: `Invalid propertyId format: ${propertyId}` });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: `Property with ID ${propertyId} not found.` });
        }
        if (property.auction) {
            return res.status(400).json({ message: 'This property already has an auction configured.' });
        }

        const now = new Date();
        const auctionStatus = new Date(startTime) > now ? 'Upcoming' : 'Live';
        const numericStartingPrice = Number(startingPrice) || 0;

        // Construct the auction object
        const newAuctionData = {
            startTime,
            endTime,
            startingPrice: numericStartingPrice,
            currentBid: numericStartingPrice,
            reservePrice: Number(reservePrice) || 0,
            status: auctionStatus,
            bids: [],
            winner: null
        };

        // 2. Log the data just before saving to see if it's correct.
        console.log('[createAuction] Attempting to save new auction data:', newAuctionData);

        property.auction = newAuctionData;
        await property.save();
        
        // ... your scheduler logic if any ...

        res.status(201).json({ message: 'Auction created successfully.', property });

    } catch (err) {
        // 3. THIS IS THE MOST IMPORTANT LOG. It will print the full crash details.
        console.error("!!! FATAL ERROR in createAuction:", err);
        res.status(500).json({ message: 'Server error creating auction. Check server logs for details.' });
    }
};

// @desc    Get details for a single auction (Admin)
// @route   GET /api/admin/auctions/:auctionId
exports.getAuctionDetails = async (req, res) => {
    try {
        const { auctionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ message: 'Invalid auction ID format.' });
        }

        const property = await Property.findById(auctionId)
            .populate('auction.bids.user', 'name email')
            .populate('auction.winner', 'name email');

        if (!property || !property.auction) {
            return res.status(404).json({ message: 'Auction not found for this property.' });
        }
        res.json(property);
    } catch (err) {
        console.error("Error in getAuctionDetails (Admin):", err);
        res.status(500).json({ message: 'Error fetching auction details.' });
    }
};

// @desc    Edit auction details
// @route   PUT /api/admin/auctions/:auctionId
exports.editAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { startTime, endTime, startingPrice, reservePrice, status } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ message: 'Invalid auction ID format.' });
        }
        
        const property = await Property.findById(auctionId);
        if (!property || !property.auction) return res.status(404).json({ message: 'Auction not found.' });

        // Update fields if they are provided
        if (startTime) property.auction.startTime = startTime;
        if (endTime) property.auction.endTime = endTime;
        if (startingPrice !== undefined) property.auction.startingPrice = Number(startingPrice);
        if (reservePrice !== undefined) property.auction.reservePrice = Number(reservePrice);
        if (status && ['Upcoming', 'Live', 'Ended', 'Cancelled', 'Paused'].includes(status)) {
            property.auction.status = status;
        }

        const updatedProperty = await property.save();
        res.json({ message: 'Auction updated successfully.', property: updatedProperty });
    } catch (err) {
        console.error('Error in editAuction:', err);
        res.status(500).json({ message: 'Error editing auction.' });
    }
};

// @desc    Cancel an auction
// @route   DELETE /api/admin/auctions/:auctionId/cancel
exports.cancelAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ message: 'Invalid auction ID format.' });
        }

        const property = await Property.findById(auctionId);
        if (!property || !property.auction) return res.status(404).json({ message: 'Auction not found.' });

        property.auction.status = 'Cancelled';
        const updatedProperty = await property.save();
        res.json({ message: 'Auction cancelled.', property: updatedProperty });
    } catch (err) {
        console.error('Error in cancelAuction:', err);
        res.status(500).json({ message: 'Error cancelling auction.' });
    }
};

// controllers/admin.controller.js - CORRECTED VERSION

// const Property = require('../../models/Property.model');
// const mongoose = require('mongoose');
// const { emitAuctionStatus } = require('../../sockets/auction.socket');

// // --- CONTROLLER FUNCTIONS ---

// // @desc    Get all auctions for the admin dashboard
// // @route   GET /api/admin/auctions
// exports.getAllAuctions = async (req, res) => {
//     console.log("[ADMIN AUCTION CTRL] GET /api/admin/auctions called");
//     try {
//         const now = new Date();
//         const propertiesWithAuctions = await Property.find({
//             'auction': { $exists: true, $ne: null }
//         })
//         .populate('auction.winner', 'name email')
//         .sort({ 'auction.startTime': -1 });

//         // Auto-update statuses based on time
//         for (const p of propertiesWithAuctions) {
//             if (!p.auction) continue;
//             const start = new Date(p.auction.startTime);
//             const end = new Date(p.auction.endTime);

//             // If endTime has passed and the auction was active or pending, it should now be 'ended'.
//             if ((p.auction.status === 'active' || p.auction.status === 'pending') && end < now) {
//                 p.auction.status = 'ended'; // CORRECTED
//                 await p.save();
//             // If startTime has passed, endTime is in the future, and status is 'pending', it should now be 'active'.
//             } else if (p.auction.status === 'pending' && start <= now && end > now) {
//                 p.auction.status = 'active'; // CORRECTED
//                 await p.save();
//             }
//         }

//         res.json(propertiesWithAuctions);

//     } catch (err) {
//         console.error("Error in admin getAllAuctions:", err.stack);
//         res.status(500).json({ message: 'Error fetching auctions.' });
//     }
// };

// // @desc    Create a new auction for a property
// // @route   POST /api/admin/auctions
// exports.createAuction = async (req, res) => {
//      console.log('[createAuction] Received request body:', req.body);
//     try {
//         const { propertyId, startTime, endTime, startingPrice, reservePrice } = req.body;
        
//          if (!propertyId || !startTime || !endTime || startingPrice === undefined) {
//             return res.status(400).json({ message: 'Property, start/end times, and starting price are required.' });
//         }
//         if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//             return res.status(400).json({ message: 'The provided propertyId is not a valid ID.' });
//         }

//         const property = await Property.findById(propertyId);
//         if (!property) return res.status(404).json({ message: 'Property not found.' });
//         if (property.auction) return res.status(400).json({ message: 'This property already has an auction configured.' });

//         const now = new Date();
//         // CORRECTED: Use 'pending' for upcoming auctions and 'active' for immediate ones.
//         const auctionStatus = new Date(startTime) > now ? 'Upcoming' : 'Live';
//         const numericStartingPrice = Number(startingPrice) || 0;
//         const numericReservePrice = Number(reservePrice) || 0;


//         const newAuctionData = {
//             startTime,
//             endTime,
//             startingPrice: numericStartingPrice,
//             currentBid: numericStartingPrice, // currentBid should start at the startingPrice
//             reservePrice: numericReservePrice,
//             status: auctionStatus,
//             bids: [],
//             winner: null
//         };

//         console.log('[createAuction] Attempting to save new auction data:', newAuctionData);

//         property.auction = newAuctionData;
//         await property.save();

//         // property.auction = {
//         //     startTime,
//         //     endTime,
//         //     startingPrice: Number(startingPrice) || 0,
//         //     currentBid: Number(startingPrice) || 0,
//         //     reservePrice: reservePrice ? Number(reservePrice) : 0,
//         //     status: auctionStatus, // This now saves the correct status
//         //     bids: [],
//         // };
        
//         // await property.save();
        
//         // Schedule the auction if you have a scheduler
//         const scheduleSingleAuction = req.app.get('scheduleSingleAuction');
//         if (scheduleSingleAuction) {
//             scheduleSingleAuction(property);
//         }

//         res.status(201).json({ message: 'Auction created successfully.', property });
//     } catch (err) {
//         console.error("Error in createAuction:", err);
//         res.status(500).json({ message: 'Error creating auction.' });
//     }
// };

// // @desc    Edit auction details
// // @route   PUT /api/admin/auctions/:auctionId
// exports.editAuction = async (req, res) => {
//     try {
//         const { auctionId } = req.params;
//         const { startTime, endTime, startingPrice, reservePrice, status } = req.body;
        
//         if (!mongoose.Types.ObjectId.isValid(auctionId)) {
//             return res.status(400).json({ message: 'Invalid auction ID format.' });
//         }
        
//         const property = await Property.findById(auctionId);
//         if (!property || !property.auction) return res.status(404).json({ message: 'Auction not found.' });

//         // Update fields if they are provided
//         if (startTime) property.auction.startTime = startTime;
//         if (endTime) property.auction.endTime = endTime;
//         if (startingPrice !== undefined) property.auction.startingPrice = Number(startingPrice);
//         if (reservePrice !== undefined) property.auction.reservePrice = Number(reservePrice);

//         // CORRECTED: Check against the valid enum values from your schema
//         if (status && ['Upcoming', 'Live', 'Paused', 'Ended', 'Cancelled'].includes(status)) {
//         property.auction.status = status;
//     }

//         const updatedProperty = await property.save();
//         res.json({ message: 'Auction updated successfully.', property: updatedProperty });
//     } catch (err) {
//         console.error('Error in editAuction:', err);
//         res.status(500).json({ message: 'Error editing auction.' });
//     }
// };

// // @desc    Cancel an auction
// // @route   DELETE /api/admin/auctions/:auctionId/cancel
// exports.cancelAuction = async (req, res) => {
//     try {
//         const { auctionId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(auctionId)) {
//             return res.status(400).json({ message: 'Invalid auction ID format.' });
//         }

//         const property = await Property.findById(auctionId);
//         if (!property || !property.auction) return res.status(404).json({ message: 'Auction not found.' });

//         property.auction.status = 'cancelled'; // CORRECTED: lowercase 'c' to match schema
//         const updatedProperty = await property.save();
//         res.json({ message: 'Auction cancelled.', property: updatedProperty });
//     } catch (err) {
//         console.error('Error in cancelAuction:', err);
//         res.status(500).json({ message: 'Error cancelling auction.' });
//     }
// };

// // You can keep your getAuctionDetails function as is, it doesn't modify data.
// exports.getAuctionDetails = async (req, res) => {
//     try {
//         const { auctionId } = req.params;
//         if (!mongoose.Types.ObjectId.isValid(auctionId)) {
//             return res.status(400).json({ message: 'Invalid auction ID format.' });
//         }

//         const property = await Property.findById(auctionId)
//             .populate('auction.bids.user', 'name email')
//             .populate('auction.winner', 'name email');

//         if (!property || !property.auction) {
//             return res.status(404).json({ message: 'Auction not found for this property.' });
//         }
//         res.json(property);
//     } catch (err) {
//         console.error("Error in getAuctionDetails (Admin):", err);
//         res.status(500).json({ message: 'Error fetching auction details.' });
//     }
// };