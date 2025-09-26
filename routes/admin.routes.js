// backend/routes/admin.routes.js
const express = require('express');
const router = express.Router();

// Import all the different admin-specific routers
const auctionAdminRoutes = require('./admin/auction.admin.routes');
const visitRequestAdminRoutes = require('./admin/visitRequests.admin.routes');
const propertyAdminRoutes = require('./admin/property.admin.routes');
const futureProjectAdminRoutes = require('./admin/futureProject.admin.routes'); 
const userAdminRoutes = require('./admin/user.admin.routes'); 

console.log('[ROUTES] admin.routes.js: Setting up admin route hub...');

// Mount each admin router under its specific sub-path
// This file now ONLY delegates. It does not define any GET/POST routes itself.

// Requests to /api/admin/auctions/* will be handled by auctionAdminRoutes
router.use('/auctions', auctionAdminRoutes);

// Requests to /api/admin/visit-requests/* will be handled by visitRequestAdminRoutes
router.use('/visit-requests', visitRequestAdminRoutes);

// Requests to /api/admin/properties/* will be handled by propertyAdminRoutes
router.use('/properties', propertyAdminRoutes);

// Requests to /api/admin/future-projects/* could be handled by future-projectsAdminRoutes
router.use('/future-projects', futureProjectAdminRoutes); 

// Requests to /api/admin/users/* could be handled by userAdminRoutes
router.use('/users', userAdminRoutes);

module.exports = router;