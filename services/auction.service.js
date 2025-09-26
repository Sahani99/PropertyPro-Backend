// // backend/services/auction.service.js
// const Property = require('../models/Property.model');

// /**
//  * Finds auctions that have ended but have not yet been processed,
//  * determines the winner, and updates the database.
//  */

// const processUpcomingAuctions = async () => {
//   console.log('Running job to process upcoming auctions...');
//   const now = new Date();

//   try {
//     const upcomingAuctions = await Property.find({
//       'auction.status': 'Upcoming',
//       'auction.startTime': { $lte: now }
//     });

//     if (upcomingAuctions.length === 0) {
//       return; // No auctions to start, exit quietly.
//     }

//     console.log(`Found ${upcomingAuctions.length} auctions to start.`);

//     for (const property of upcomingAuctions) {
//       // Additional check to make sure it hasn't already ended
//       if (new Date(property.auction.endTime) > now) {
//         property.auction.status = 'Live';
//         await property.save();
//         console.log(`Auction for "${property.title}" has been set to Live.`);
//       }
//     }
//   } catch (error) {
//     console.error('Error processing upcoming auctions:', error);
//   }
// };


// const processEndedAuctions = async () => {
//   console.log('Running job to process ended auctions...');
//   const now = new Date();

//   try {
//     // THIS IS THE FIX: The query now looks for the capitalized 'Live' status.
//     const endedAuctions = await Property.find({
//       'auction.status': 'Live', // <--- THE FIX
//       'auction.endTime': { $lte: now } // Find auctions where endTime is in the past
//     });

//     if (endedAuctions.length === 0) {
//       console.log('No auctions to process.');
//       return;
//     }

//     console.log(`Found ${endedAuctions.length} auctions to process.`);

//     for (const property of endedAuctions) {
//       const auction = property.auction;
//       let winner = null;

//       if (auction.bids && auction.bids.length > 0) {
//         // Sort bids to find the highest one
//         const winningBid = auction.bids.sort((a, b) => b.amount - a.amount)[0];

//         if (winningBid.amount >= auction.reservePrice) {
//           winner = winningBid.user;
//           console.log(`Auction for "${property.title}" won by user ${winner} with bid ${winningBid.amount}`);
//         } else {
//           console.log(`Auction for "${property.title}" ended but reserve price was not met.`);
//         }
//       } else {
//         console.log(`Auction for "${property.title}" ended with no bids.`);
//       }

//       // THIS IS THE SECOND FIX: Update the status to the new capitalized 'Ended'.
//       property.auction.status = 'Ended'; // <--- THE FIX
//       property.auction.winner = winner;

//       await property.save();
//     }
//   } catch (error) {
//     console.error('Error processing ended auctions:', error);
//   }
// };



// module.exports = { 
//   processUpcomingAuctions, 
//   processEndedAuctions };

// in backend/services/auction.service.js

const Property = require('../models/Property.model');

/**
 * Finds auctions that are 'Upcoming' and whose start time has passed,
 * and updates their status to 'Live'.
 */
const processUpcomingAuctions = async () => {
  console.log('[Scheduler] Running job to start upcoming auctions...');
  const now = new Date();
  try {
    const auctionsToStart = await Property.find({
      'auction.status': 'Upcoming',
      'auction.startTime': { $lte: now },
      'auction.endTime': { $gt: now } // Make sure it hasn't already ended
    });

    if (auctionsToStart.length === 0) return;

    console.log(`[Scheduler] Found ${auctionsToStart.length} auctions to start.`);
    for (const property of auctionsToStart) {
      property.auction.status = 'Live';
      await property.save();
      console.log(`[Scheduler] Auction for "${property.title}" has been set to Live.`);
      // You could emit a socket event here if needed
    }
  } catch (error) {
    console.error('[Scheduler] Error processing upcoming auctions:', error);
  }
};

/**
 * Finds auctions that are 'Live' and whose end time has passed,
 * and updates their status to 'Ended'.
 */
const processEndedAuctions = async () => {
  console.log('[Scheduler] Running job to end live auctions...');
  const now = new Date();
  try {
    const auctionsToEnd = await Property.find({
      'auction.status': 'Live',
      'auction.endTime': { $lte: now }
    });

    if (auctionsToEnd.length === 0) return;

    console.log(`[Scheduler] Found ${auctionsToEnd.length} auctions to end.`);
    for (const property of auctionsToEnd) {
        // ... (your existing winner processing logic can go here)
        let winner = null;
        if (property.auction.bids && property.auction.bids.length > 0) {
            const winningBid = property.auction.bids.sort((a, b) => b.amount - a.amount)[0];
            if (winningBid.amount >= property.auction.reservePrice) {
                winner = winningBid.user;
            }
        }
        property.auction.winner = winner;
        property.auction.status = 'Ended';
        await property.save();
        console.log(`[Scheduler] Auction for "${property.title}" has been set to Ended.`);
    }
  } catch (error) {
    console.error('[Scheduler] Error processing ended auctions:', error);
  }
};

module.exports = {
  processUpcomingAuctions,
  processEndedAuctions
};