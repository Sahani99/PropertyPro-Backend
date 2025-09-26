// seedAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User.model'); // Adjust path
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env file.");
  process.exit(1);
}

const seedAdminUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for admin seeding.');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      // Optionally, update password or details if needed
      // existingAdmin.password = ADMIN_PASSWORD; // Mongoose pre-save hook will re-hash
      // await existingAdmin.save();
      // console.log('Admin password updated (if changed).');
      return;
    }

    // Create new admin
    const adminUser = new User({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Password will be hashed by pre-save hook
      role: 'admin',
      name: 'Administrator'
    });
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD} (This is the plain text, it's hashed in DB)`);

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  }
};

seedAdminUser();