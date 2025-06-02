const Property = require('../models/Property.model');

exports.getAllProperties = async (req, res) => {
  try {
    const {
      search,         // For text search
      minPrice,       // For price range filter
      maxPrice,       // For price range filter
      bedrooms,       // For bedrooms filter
      propertyType,   // For property type filter
      sortBy,         // For sorting field (e.g., 'price', 'dateAdded')
      sortOrder,      // For sorting order ('asc' or 'desc')
      // You can add more query params for other filters like area, status etc.
      // e.g. minArea, maxArea, status
    } = req.query;

    let query = {}; // This object will hold our Mongoose query conditions

    // 1. Text Search
    if (search) {
      // Using $text search (requires text index in the model)
      query.$text = { $search: search };
      // Alternatively, for partial matching without a text index (less performant for large datasets):
      // query.$or = [
      //   { title: { $regex: search, $options: 'i' } }, // 'i' for case-insensitive
      //   { description: { $regex: search, $options: 'i' } },
      //   { address: { $regex: search, $options: 'i' } }
      // ];
    }

    // 2. Filtering
    // Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Bedrooms
    if (bedrooms) {
      query.bedrooms = Number(bedrooms); // Exact match
      // Or for minimum bedrooms: query.bedrooms = { $gte: Number(bedrooms) };
    }

    // Property Type
    if (propertyType) {
      // Ensure propertyType is one of the enum values if sent from frontend
      const validTypes = ['house', 'apartment'];
      if (validTypes.includes(propertyType.toLowerCase())) {
        query.propertyType = propertyType.toLowerCase();
      }
    }

    // (Add more filters for 'area', 'status' similarly if needed)
    // Example for area:
    // if (req.query.minArea || req.query.maxArea) {
    //   query.area = {};
    //   if (req.query.minArea) query.area.$gte = Number(req.query.minArea);
    //   if (req.query.maxArea) query.area.$lte = Number(req.query.maxArea);
    // }


    // 3. Sorting
    let sortOptions = {};
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      // Sanitize sortBy to prevent issues, only allow specific fields
      const allowedSortByFields = ['price', 'dateAdded', 'area', 'bedrooms'];
      if (allowedSortByFields.includes(sortBy)) {
        sortOptions[sortBy] = order;
      } else {
        sortOptions['dateAdded'] = -1; // Default sort
      }
    } else {
      sortOptions['dateAdded'] = -1; // Default sort if nothing specified
    }

    // console.log('Constructed Query:', JSON.stringify(query));
    // console.log('Sort Options:', sortOptions);

    const properties = await Property.find(query).sort(sortOptions);

    res.json(properties);
  } catch (err) {
    console.error("Error in getAllProperties:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProperty = async (req, res) => {
  const property = new Property(req.body);
  try {
    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Property not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
