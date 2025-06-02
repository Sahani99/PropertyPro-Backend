// models/Property.model.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  address: { // For location keywords, searching this field will be key
    type: String,
    required: true
  },
  area: { // You can filter by area range too
    type: Number,
    required: true
  },
  // ****** NEW FIELD ******
  bedrooms: { // Add bedrooms
    type: Number,
    required: false, // Or true, depending on your data
    default: 1
  },
  imageUrls: {
    type: [String],
    default: []
  },
  propertyType: { // For filtering by type
    type: String,
    enum: ['house', 'apartment'],
    default: 'house'
  },
  status: { // Could also be a filter if needed
    type: String,
    enum: ['for sale', 'sold', 'pending'],
    default: 'for sale'
  },
  dateAdded: { // For sorting
    type: Date,
    default: Date.now
  }
});

// ****** ADD TEXT INDEX for searching title, description, and address ******
propertySchema.index({
  title: 'text',
  description: 'text',
  address: 'text'
});

module.exports = mongoose.model('Property', propertySchema);