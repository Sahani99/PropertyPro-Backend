const mongoose = require('mongoose');

const futureApartmentProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  expectedCompletionDate: { type: Date },
  status: { type: String, default: 'Planning' },
  glbModelUrl: { type: String }, // Will store the Cloudinary URL for the 3D model
  glbModelSecureUrl: { type: String }, // Cloudinary often provides both
  glbModelPublicId: { type: String }, // Useful for transformations or deletion
  coverImageUrl: { type: String },
  coverImageSecureUrl: { type: String },
  coverImagePublicId: { type: String },
  // ... any other fields
}, { timestamps: true });

module.exports = mongoose.model('FutureApartmentProject', futureApartmentProjectSchema);