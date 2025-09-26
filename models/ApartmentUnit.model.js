// models/ApartmentUnit.model.js
const mongoose = require('mongoose');

const apartmentUnitSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the parent FutureApartmentProject
    ref: 'FutureApartmentProject',        // Name of the model to reference
    required: true,
  },
  unitTypeName: { type: String, required: true }, // e.g., "Type A - 2 Bedroom"
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  areaSqft: { type: Number },
  estimatedPriceRange: { type: String }, // e.g., "$400k - $450k" or you can use minPrice, maxPrice numbers
  description: { type: String },
  totalUnits: { type: Number, default: 0 },    // Total number of this type being built
  availableUnits: { type: Number, default: 0 }, // How many are currently available
  features: { type: [String], default: [] },    // Array of feature strings
  floorPlanImageUrl: { type: String },         // Cloudinary URL for the floor plan image
  floorPlanImageSecureUrl: { type: String },
  floorPlanImagePublicId: { type: String },    // For Cloudinary deletion/management
  // ... any other specific unit fields
}, { timestamps: true });

module.exports = mongoose.model('ApartmentUnit', apartmentUnitSchema);