// backend/controllers/property.controller.js
const Property = require('../models/Property.model');
const mongoose = require('mongoose');

// @desc    Get all publicly available properties
// @route   GET /api/properties
// @access  Public
const getAllProperties = async (req, res) => {
    try {
        // 1. Get all the query parameters from the frontend request.
        const {
            search,
            minPrice,
            maxPrice,
            bedrooms,
            propertyType,
            listingType,
            sortBy = 'createdAt', // Default sort field
            sortOrder = 'desc'   // Default sort order
        } = req.query;

        // 2. Start with a base filter that only includes available properties.
        const filter = {
            status: { $in: ['for sale'] } // Default to 'for sale'
        };

        // 3. Dynamically build the filter object based on the query parameters.

        // Handle keyword search (searches title and address)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
                { address: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Handle price range (Note: converting millions from frontend)
        const priceFilter = {};
        if (minPrice) {
            priceFilter.$gte = parseFloat(minPrice) * 1000000;
        }
        if (maxPrice) {
            priceFilter.$lte = parseFloat(maxPrice) * 1000000;
        }
        if (Object.keys(priceFilter).length > 0) {
            filter.price = priceFilter;
        }

        // Handle minimum bedrooms
        if (bedrooms) {
            filter.bedrooms = { $gte: parseInt(bedrooms, 10) };
        }

        // Handle property type
        if (propertyType) {
            filter.propertyType = propertyType;
        }

        // Handle listing type (sale vs. auction)
        if (listingType === 'auction') {
            filter.status = 'auction'; // If they select auction, override the default
        } else if (listingType === 'sale') {
            filter.status = 'for sale'; // Explicitly set for sale
        } else {
             // If no listingType is specified, find both.
            filter.status = { $in: ['for sale', 'auction'] };
        }

        // 4. Build the sort object for Mongoose.
        const sort = {};
        const validSortFields = ['price', 'area', 'bedrooms', 'createdAt']; // Whitelist sort fields
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        sort[sortField] = sortOrder === 'asc' ? 1 : -1; // 1 for ascending, -1 for descending

        console.log('[API LOG] Searching properties with filter:', JSON.stringify(filter, null, 2));
        console.log('[API LOG] Sorting with:', sort);


        // 5. Execute the final query with the dynamic filter and sort options.
        const properties = await Property.find(filter).sort(sort);

        res.status(200).json(properties);

    } catch (error) {
        console.error("Error in getAllProperties (Public):", error);
        res.status(500).json({ message: "Server error while fetching properties." });
    }
};

// @desc    Get a single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid property ID format.' });
        }
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found.' });
        }
        res.json(property);
    } catch (error) {
        console.error("Error in getPropertyById (Public):", error);
        res.status(500).json({ message: "Server error while fetching property details." });
    }
};


// Note: createProperty, updateProperty, deleteProperty should be in an ADMIN controller.
// We are only exporting public functions here.

module.exports = {
    getAllProperties,
    getPropertyById
};