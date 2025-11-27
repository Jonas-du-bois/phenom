import mongoose from 'mongoose';

/**
 * @file database.js
 * @description MongoDB connection configuration using Mongoose.
 * Supports local MongoDB and MongoDB Atlas.
 * Images are handled via Cloudinary, so GridFS is not needed.
 */

/**
 * Connects to MongoDB (local or Atlas).
 * Automatically loads variables from .env.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_TEST_URI
      : process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    // Detect if connecting to Atlas or local
    const isAtlas = uri.includes('mongodb+srv://');

    // Disable autoIndex in production for performance and security
    mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      // Do not force IPv4 for Atlas (supports IPv6)
      ...(isAtlas ? {} : { family: 4 })
    };

    await mongoose.connect(uri, options);

    const connectionType = isAtlas ? 'MongoDB Atlas (Cloud)' : `MongoDB Local (${mongoose.connection.host})`;
    console.log(`✅ ${connectionType} connected successfully`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   AutoIndex: ${mongoose.get('autoIndex') ? 'enabled (dev)' : 'disabled (prod)'}`);
    console.log('   Images: Cloudinary (CDN)');

    // Connection event handling
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed (SIGINT)');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

/**
 * Closes the MongoDB connection.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing connection:', error.message);
    throw error;
  }
};

export { connectDB, disconnectDB };
