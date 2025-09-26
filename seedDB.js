const mongoose = require('mongoose');
require('dotenv').config(); // To load MONGODB_URI

const Property = require('./models/Property.model'); // Adjust path to your model

const sampleProperties = [
  // ... (copy the full sampleProperties array from above here) ...
  {
    title: "Spacious Downtown Apartment",
    description: "A beautiful and modern apartment located in the heart of downtown, close to all amenities and public transport. Features an open-plan living area and stunning city views.",
    price: 450000,
    address: "123 Main St, City Center, Anytown, AT 12345",
    area: 120,
    bedrooms: 2,
    imageUrls: ["https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg", "https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg"],
    propertyType: "apartment",
    status: "for sale",
    dateAdded: new Date("2023-01-15T10:00:00Z")
  },
  {
    title: "Cozy Suburban House with Garden",
    description: "Charming single-family house in a quiet suburban neighborhood. Perfect for families, with a large garden and spacious rooms.",
    price: 650000,
    address: "456 Oak Ave, Green Meadows, Anytown, AT 67890",
    area: 200,
    bedrooms: 4,
    imageUrls: ["https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg", "https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg"],
    propertyType: "house",
    status: "for sale",
    dateAdded: new Date("2023-03-22T14:30:00Z")
  },
  {
    title: "Luxury Penthouse with Ocean View",
    description: "Exclusive penthouse offering breathtaking ocean views, top-of-the-line finishes, and a private terrace. Ultimate luxury living.",
    price: 1250000,
    address: "789 Ocean Dr, Seaside Heights, Anytown, AT 10112",
    area: 300,
    bedrooms: 3,
    imageUrls: ["https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg"],
    propertyType: "apartment",
    status: "for sale",
    dateAdded: new Date("2023-02-10T09:15:00Z")
  },
  {
    title: "Modern Townhouse Near Park",
    description: "Stylish and contemporary townhouse located steps away from the city park. Features smart home technology and energy-efficient design.",
    price: 550000,
    address: "101 Park Lane, Willow Creek, Anytown, AT 13141",
    area: 150,
    bedrooms: 3,
    imageUrls: ["https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg"],
    propertyType: "house",
    status: "pending",
    dateAdded: new Date("2023-04-05T11:00:00Z")
  },
  {
    title: "Affordable Studio Apartment",
    description: "A compact and affordable studio apartment, ideal for students or single professionals. Well-connected by public transport.",
    price: 250000,
    address: "222 University Rd, Campus Town, Anytown, AT 15161",
    area: 50,
    bedrooms: 1,
    imageUrls: ["https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg"],
    propertyType: "apartment",
    status: "for sale",
    dateAdded: new Date("2023-05-01T16:45:00Z")
  },
  {
    title: "Charming Countryside Cottage",
    description: "A quaint cottage nestled in the serene countryside, perfect for a peaceful retreat. Features a fireplace and large windows.",
    price: 350000,
    address: "77 Country Rd, Green Valley, Farmland, FA 54321",
    area: 90,
    bedrooms: 2,
    imageUrls: ["https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg"],
    propertyType: "house",
    status: "sold",
    dateAdded: new Date("2022-12-01T08:00:00Z")
  },
  {
    title: "Beachfront Villa with Private Pool",
    description: "Magnificent villa right on the beach, offering stunning sunset views and a private infinity pool. Ideal for luxury getaways.",
    price: 2500000,
    address: "1 Paradise Cove, Sandy Shores, Anytown, AT 20202",
    area: 450,
    bedrooms: 5,
    imageUrls: ["https://www.houseplans.net/news/wp-content/uploads/2023/07/51550-768.jpeg"],
    propertyType: "house",
    status: "for sale",
    dateAdded: new Date("2023-06-10T12:00:00Z")
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding.");

    // Clear existing properties (optional, be careful with this in production!)
    console.log("Deleting existing properties...");
    await Property.deleteMany({});
    console.log("Existing properties deleted.");

    // Insert sample properties
    console.log("Inserting sample properties...");
    await Property.insertMany(sampleProperties);
    console.log("Sample properties inserted successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    mongoose.connection.close(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  }
};

seedDB();