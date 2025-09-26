// @desc    Admin: Search properties with optional query and sort by district
// @route   GET /api/admin/properties/search?q=...&district=...&sort=district
// @access  Private (Admin)
exports.searchPropertiesAdmin = async (req, res) => {
    try {
        const { q, district, sort } = req.query;
        const filter = {};

        if (q) {
            // Search by title, address, or description (case-insensitive)
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }
        if (district) {
            // Assuming district is a field in Property
            filter.district = district;
        }

        let sortOption = {};
        if (sort === 'district') {
            sortOption = { district: 1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const properties = await Property.find(filter).sort(sortOption);
        res.json(properties);
    } catch (error) {
        console.error("Error in searchPropertiesAdmin:", error);
        res.status(500).json({ message: "Server error while searching properties." });
    }
};
// backend/controllers/admin/property.admin.controller.js
const Property = require('../../models/Property.model');
const mongoose = require('mongoose');

// --- Import the unified notification service ---
const { notifyAllUsers, NEW_PROPERTY } = require('../../utils/notificationService');

// --- Helper function to parse property fields from request body ---
const parsePropertyData = (body) => {
    const data = {};
    const fields = ['title', 'description', 'address', 'area', 'propertyType', 'status'];
    const numericFields = ['price', 'bedrooms', 'bathrooms'];

    fields.forEach(field => {
        if (body[field]) data[field] = body[field];
    });

    numericFields.forEach(field => {
        if (body[field] !== undefined && !isNaN(parseFloat(body[field]))) {
            data[field] = parseFloat(body[field]);
        }
    });
    
    // You can add specific handling for auction data if it's sent in the same form
    // For example:
    if (body.auctionStartTime || body.auctionEndTime || body.auctionStartingPrice) {
        data.auction = {
            startTime: body.auctionStartTime || undefined,
            endTime: body.auctionEndTime || undefined,
            startingPrice: body.auctionStartingPrice ? parseFloat(body.auctionStartingPrice) : 0,
            currentBid: body.auctionStartingPrice ? parseFloat(body.auctionStartingPrice) : 0,
            status: 'pending',
            isActive: true, // You might set this to false until you explicitly start it
        };
    }

    return data;
};

// @desc    Admin: Create a new property
// @route   POST /api/admin/properties
// @access  Private (Admin)
exports.createProperty = async (req, res) => {
    try {
        const { title, price, address, propertyType } = req.body;

        // --- Basic Validation ---
        if (!title || !price || !address || !propertyType) {
            return res.status(400).json({ message: 'Title, price, address, and propertyType are required fields.' });
        }

        // --- Prepare Property Data ---
        const propertyData = { ...req.body };

        // This is a standard property, so its status is 'for sale'
        propertyData.status = 'for sale';
        
        // Ensure no stray auction data is saved
        delete propertyData.auction;
        delete propertyData.isAuction;

        // --- Handle Image Uploads ---
        if (req.files && req.files.length > 0) {
            propertyData.imageUrls = req.files.map(file => file.path);
        } else {
            propertyData.imageUrls = [];
        }

        // --- Create and Save Property ---
        const newProperty = new Property(propertyData);
        await newProperty.save();

        // --- Notify All Users ---
        // NEW_PROPERTY is now imported from the same notificationService
        await notifyAllUsers(
            NEW_PROPERTY,
            `New property "${newProperty.title}" has been added. Check it out!`
        );

        // --- Emit Real-Time Notification via Socket.IO ---
        // This part remains as it's for real-time updates, not database notifications
        const io = req.app.get('io');
        io.emit('newPropertyNotification', {
            title: newProperty.title,
            propertyId: newProperty._id,
            message: `New property "${newProperty.title}" has been added.`
        });

        console.log(`[ADMIN CTRL] Property created successfully: ${newProperty.title} (ID: ${newProperty._id})`);
        res.status(201).json({ message: 'Property created successfully!', property: newProperty });

    } catch (error) {
        console.error("Error in createProperty (Admin):", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ message: "Server error while creating property." });
    }
};

// @desc    Admin: Update an existing property
// @route   PUT /api/admin/properties/:id
// @access  Private (Admin)
// exports.updateProperty = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updates = { ...req.body };
//         let existingImageUrls = [];
//         if (req.body.existingImageUrls) {
//             existingImageUrls = JSON.parse(req.body.existingImageUrls);
//         }
//         let newImageUrls = [];
//         if (req.files && req.files.length > 0) {
//             newImageUrls = req.files.map(file => file.path);
//         }
//         updates.imageUrls = [...existingImageUrls, ...newImageUrls];
//         const updatedProperty = await Property.findByIdAndUpdate(
//             id,
//             { $set: updates },
//             { new: true, runValidators: true }
//         );
//         if (!updatedProperty) {
//             return res.status(404).json({ message: 'Property not found.' });
//         }
//         res.json({ message: 'Property updated successfully!', property: updatedProperty });
//     } catch (error) {
//         res.status(500).json({ message: "Server error while updating property." });
//     }
// };

exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Parse the stringified JSON data from the FormData object
        const propertyData = JSON.parse(req.body.propertyData);
        const auctionData = JSON.parse(req.body.auctionData);
        const isAuction = req.body.isAuction === 'yes';
        const existingImageUrls = JSON.parse(req.body.existingImageUrls || '[]');

        // 2. Get the paths of any newly uploaded images from multer
        const newImageUrls = req.files ? req.files.map(file => file.path) : [];

        // 3. Combine the list of old images to keep with the newly uploaded ones
        propertyData.imageUrls = [...existingImageUrls, ...newImageUrls];

        // 4. Handle the auction object based on the 'isAuction' flag
        if (isAuction) {
            // If the property is being set as an auction, merge the auction data
            propertyData.auction = { ...propertyData.auction, ...auctionData };
        } else {
            // If it's NOT an auction, ensure the auction field is completely removed
            propertyData.auction = undefined;
        }

        // 5. Find the property by its ID and update it with the cleaned data
        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { $set: propertyData }, // Use $set to update only the provided fields
            { new: true, runValidators: true } // Options to return the new doc and run schema validation
        );

        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found.' });
        }
        
        res.json({ message: 'Property updated successfully!', property: updatedProperty });
    } catch (error) {
        // This will log the specific crash reason to your backend terminal
        console.error("!!! FATAL ERROR in updateProperty (Admin):", error);
        res.status(500).json({ message: "Server error while updating property." });
    }
};


// @desc    Admin: Delete a property
// @route   DELETE /api/admin/properties/:id
// @access  Private (Admin)
exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid property ID format.' });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found.' });
        }

        // Optional: Before deleting from DB, you might want to delete associated images
        // from your cloud storage (e.g., Cloudinary). This is an advanced step.
        // For example:
        // if (property.imageUrls && property.imageUrls.length > 0) {
        //   // Code to loop through URLs and call your cloud storage's delete API
        // }

        await property.deleteOne(); // Or Property.findByIdAndDelete(id)

        console.log(`[ADMIN CTRL] Property deleted successfully: ${property.title} (ID: ${id})`);
        res.json({ message: 'Property deleted successfully.' });

    } catch (error) {
        console.error("Error in deleteProperty (Admin):", error);
        res.status(500).json({ message: "Server error while deleting property." });
    }
};

// --- Also include the read-only functions for admin ---

// Admin: Get ALL properties regardless of status
exports.getAllPropertiesAdmin = async (req, res) => {
    try {
        const { search, district, sort } = req.query;
        const filter = {};

        // Build search query for title and address
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }
        // Build filter for district
        if (district) {
            filter.district = district;
        }

        // Build sort options
        let sortOption = { createdAt: -1 }; // Default sort
        if (sort === 'district') {
            sortOption = { district: 1 };
        } else if (sort === 'price_asc') {
            sortOption = { price: 1 };
        } else if (sort === 'price_desc') {
            sortOption = { price: -1 };
        }

        console.log('[ADMIN CTRL] Searching properties with filter:', filter, 'and sort:', sortOption);

        const properties = await Property.find(filter).sort(sortOption);
        res.json(properties);

    } catch (error) {
        console.error("Error in getAllPropertiesAdmin:", error);
        res.status(500).json({ message: "Server error while fetching properties." });
    }
};

// Admin: Get a single property regardless of status
exports.getPropertyByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid property ID format.' });
        }
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ message: "Property not found." });
        res.json(property);
    } catch (error) {
        console.error("Error in getPropertyByIdAdmin:", error);
        res.status(500).json({ message: "Server error." });
    }
};