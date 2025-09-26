// backend/controllers/profile.controller.js
const User = require('../models/User.model');
const Property = require('../models/Property.model');
const VisitRequest = require('../models/VisitRequests.model');

// @desc    Update the current logged-in user's profile details
// @route   PUT /api/profile/me
// @access  Private (Authenticated Users)
exports.updateMyProfile = async (req, res) => {
    // User ID is securely taken from the token via the checkAuth middleware
    const userId = req.loggedInUser?._id;
    const { name, phone } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update fields if they are provided in the request body
        user.name = name || user.name;
        user.phone = phone || user.phone;
        // Note: Email and password changes should be handled in separate, dedicated functions.

        const updatedUser = await user.save();

        // Return the updated user object, excluding the password
        const userToReturn = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone
        };

        res.json({
            message: 'Profile updated successfully.',
            user: userToReturn
        });

    } catch (error) {
        console.error("Error in updateMyProfile:", error);
        res.status(500).json({ message: "Server error while updating profile." });
    }
};

// @desc    Change the current logged-in user's password
// @route   PUT /api/profile/change-password
// @access  Private (Authenticated Users)
exports.changeMyPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.loggedInUser?._id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide current and new passwords.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    try {
        // We need to select '+password' because the schema defaults to excluding it
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the current password matches
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // Set the new password (the pre-save hook in User.model.js will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully.' });

    } catch (error) {
        console.error("Error in changeMyPassword:", error);
        res.status(500).json({ message: "Server error while changing password." });
    }
};


// @desc    Get all visit requests submitted by the logged-in user
// @route   GET /api/profile/my-visit-requests
// @access  Private (Authenticated Users)
exports.getMyVisitRequests = async (req, res) => {
    try {
        const userId = req.loggedInUser._id;
        const myRequests = await VisitRequest.find({ userId: userId })
            .populate('propertyId', 'title address imageUrls') // Populate with some property info
            .sort({ createdAt: -1 });
        res.json(myRequests);
    } catch (error) {
        console.error("Error in getMyVisitRequests:", error);
        res.status(500).json({ message: "Server error fetching your visit requests." });
    }
};



// @desc    Get all auctions a user has placed a bid on
// @route   GET /api/profile/my-bids
// @access  Private (Authenticated Users)
exports.getMyBids = async (req, res) => {
    try {
        const userId = req.loggedInUser._id;

        // Find all properties where the current user has placed a bid.
        // Fetch all the necessary fields for the frontend card.
        const properties = await Property.find({ 
             'auction.status': 'Live',
             'auction.bids.user': userId 
            })
            .select('title imageUrls auction.status auction.currentBid auction.bids');

        if (!properties || properties.length === 0) {
            return res.json([]);
        }
        
        // Map over the properties to create the correct data structure.
        const myBidDetails = properties.map(p => {
            // Filter to get only the current user's bids for this property.
            const userBids = p.auction.bids.filter(bid => bid.user.equals(userId));
            
            // Find the highest bid amount from that user.
            const myHighestBid = Math.max(...userBids.map(bid => bid.amount));

            return {
                propertyId: p._id,
                propertyTitle: p.title,
                // Send the first image as the thumbnail for the card.
                propertyImage: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : null,
                auctionStatus: p.auction.status,
                currentBid: p.auction.currentBid,
                myHighestBid: myHighestBid
            };
        });

        res.json(myBidDetails);
    } catch (error) {
        console.error("Error in getMyBids:", error);
        res.status(500).json({ message: "Server error fetching your bids." });
    }
};


// @desc    Get all auctions a user has won
// @route   GET /api/profile/my-wins
// @access  Private (Authenticated Users)
exports.getMyWins = async (req, res) => {
    try {
        const userId = req.loggedInUser._id;
        // The query itself is correct.
        const wonAuctions = await Property.find({ 
            'auction.winner': userId, 
            'auction.status': 'Ended'
            })
            .select('title auction.currentBid auction.endTime');
        
        res.json(wonAuctions);
    } catch (error) {
        console.error("Error in getMyWins:", error);
        res.status(500).json({ message: "Server error fetching your won auctions." });
    }
};