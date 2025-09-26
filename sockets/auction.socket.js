// backend/controllers/auctionSocket.js
// Socket.IO auction event helpers
const Property = require('../models/Property.model');

function emitAuctionStatus(io, propertyId, status, currentBid) {
  io.emit('auctionStatus', { propertyId, status, currentBid });
}

async function checkAndEmitAuctionStatus(io) {
  // Find all auctions and emit their real-time status
  const now = new Date();
  const properties = await Property.find({ 'auction': { $exists: true, $ne: null } });
  properties.forEach(p => {
    let status = p.auction.status;
    if (status !== 'Ended') {
      if (new Date(p.auction.startTime) > now) status = 'Upcoming';
      else if (new Date(p.auction.endTime) < now) status = 'Ended';
      else status = 'Live';
    }
    emitAuctionStatus(io, p._id.toString(), status, p.auction.currentBid);
  });
}

module.exports = { emitAuctionStatus, checkAndEmitAuctionStatus };
