// models/User.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'registered', 'guest'],
    default: 'registered' // Changed default to 'registered' for new users
  },
  dateJoined: {
    type: Date,
    default: Date.now
  }
});

// Optional: Pre-save hook to ensure email is lowercase before saving
// userSchema.pre('save', async function (next) {
//   if (this.isModified('email')) {
//     this.email = this.email.toLowerCase();
//   }
//   next();
// });

module.exports = mongoose.model('User', userSchema);