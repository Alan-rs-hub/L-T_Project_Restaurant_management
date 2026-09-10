const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('../seeds/seed');
const User = require('../models/User');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management';
  
  try {
    console.log(`Connecting to MongoDB at: ${uri}...`);
    // Attempt standard connection with a short timeout
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (err) {
    console.log('Local MongoDB service not reachable. Initializing embedded in-memory MongoDB instance...');
    try {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'restaurant_management'
        }
      });
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`Embedded MongoDB Connected: ${memoryUri}`);
    } catch (innerErr) {
      console.error('Fatal: Failed to start embedded MongoDB:', innerErr.message);
      process.exit(1);
    }
  }

  // Check if database needs initial seeding
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Automatically seeding demo dataset...');
      await seedDatabase(false);
    }
  } catch (seedErr) {
    console.error('Auto-seed check warning:', seedErr.message);
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = connectDB;
