const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'registered', 'guest'],
    default: 'registered' 
  },
  phone: { type: String },
  active: { type: Boolean, default: true }, 
  dateJoined: {
    type: Date,
    default: Date.now
  },
  // --- NEW FIELDS FOR PASSWORD RESET ---
  passwordResetToken: String,
  passwordResetExpires: Date,
  // ------------------------------------
}, {
  timestamps: true 
});

// Optional: Pre-save hook to ensure email is lowercase before saving
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    // Or if the user is new (i.e., this.isNew is true)
    if (!this.isModified('password')) {
        // Handle the case where the passwordResetToken is being updated
        // but the password itself isn't, to avoid rehashing the password.
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare passwords (keep this)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;