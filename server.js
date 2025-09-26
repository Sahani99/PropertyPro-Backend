const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// --- Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});
app.set('io', io); // Make 'io' accessible in controllers

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// --- IMPORT ROUTE FILES ---
// User-facing / Public routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const auctionRoutes = require('./routes/auction.routes');
const visitRequestRoutes = require('./routes/visitRequests.routes');
const futureProjectRoutes = require('./routes/futureProject.routes');
const profileRoutes = require('./routes/profile.routes');

// Admin routes
const adminRoutes = require('./routes/admin.routes');

// ✅ NEW: Notification route
const notificationRoutes = require('./routes/Notification.routes');

// --- API ROUTES ---
app.get('/api', (req, res) => res.json({ message: 'PropertyPro API is operational' }));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/visit-requests', visitRequestRoutes);
app.use('/api/future-projects', futureProjectRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Mount Notification Route
app.use('/api/notifications', notificationRoutes);

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err.name, err.message);
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

require('./scheduler'); 

// --- Start the Server ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Backend server with Socket.IO running on http://localhost:${PORT}`);
});

// --- Socket.IO Connection Handler ---
io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id);
  });
});