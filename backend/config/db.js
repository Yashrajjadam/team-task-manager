const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    // Debug: check if URI is set (don't log full URI for security)
    if (!uri) {
      console.error('❌ MONGODB_URI environment variable is NOT set!');
      process.exit(1);
    }

    // Log sanitized URI (hide password)
    const sanitized = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`🔗 Connecting to: ${sanitized}`);

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
