const mongoose = require('mongoose');
const bidSchema = require('./Bid.model');

const auctionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    // required: true, // This is too strict for initial creation
  },
  endTime: {
    type: Date,
    // required: true,
  },
  startingPrice: {
    type: Number,
    default: 0, // A default value is better than making it required
  },
  currentBid: {
    type: Number,
    default: 0, // A default value is better
  },
  reservePrice: {
    type: Number,
    default: 0,
  },
  // status: {
  //   type: String,
  //   enum: ['Upcoming', 'Live', 'Ended', 'Cancelled', 'Paused'],
  //   default: 'Upcoming',
 status: {
  type: String,
  enum: ['Upcoming', 'Live', 'Paused', 'Ended', 'Cancelled'], 
    // CHANGE THE DEFAULT TO MATCH YOUR NEW CONVENTION
  default: 'Upcoming', 
},
  bids: [bidSchema],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = auctionSchema;