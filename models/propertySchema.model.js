
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: String,
    location: String,
    price: Number,
    description: String,
    // Add other fields as needed
});

module.exports = mongoose.model(propertySchema);
