// // backend/scheduler.js
// const cron = require('node-cron');
// const { processEndedAuctions } = require('./services/auction.service');

// // Schedule the job to run every minute
// // The cron expression '* * * * *' means "at every minute"
// cron.schedule('* * * * *', () => {
//   console.log('Triggering the auction processing job...');
//   processEndedAuctions();
// });

// console.log('Auction processing scheduler started.');

// in backend/scheduler.js

const { processUpcomingAuctions, processEndedAuctions } = require('./services/auction.service');

const JOB_INTERVAL_MS = 30000; // 30 seconds

console.log(`[Scheduler] Auction status update job scheduled to run every ${JOB_INTERVAL_MS / 1000} seconds.`);

// Run the jobs immediately on server start
processUpcomingAuctions();
processEndedAuctions();

// Then, run them on a recurring interval
setInterval(() => {
  console.log('[Scheduler] Triggering periodic auction status updates...');
  processUpcomingAuctions();
  processEndedAuctions();
}, JOB_INTERVAL_MS);