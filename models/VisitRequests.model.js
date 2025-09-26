const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitRequestSchema = new Schema({
    propertyId: {
        type: Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property ID is required for a visit request.'],
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for a visit request.'],
        index: true,
    },
    userName: {
        type: String,
        required: [true, 'User name is required.'],
        trim: true,
    },
    userEmail: {
        type: String,
        required: [true, 'User email is required.'],
        trim: true,
        lowercase: true,
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required.'],
        trim: true,
    },
    preferredDate: {
        type: Date,
        required: [true, 'Preferred visit date is required.'],
    },
    preferredTime: {
        type: String,
        required: [true, 'Preferred visit time is required.'],
        trim: true,
    },
    message: {
        type: String,
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters.']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'declined', 'completed', 'cancelled_by_user', 'cancelled_by_admin'],
        default: 'pending',
        required: true,
        index: true,
    },
    adminNotes: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

const VisitRequest = mongoose.model('VisitRequest', visitRequestSchema);
module.exports = VisitRequest;