const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  const uri = process.env.MONGODB_URI;

  // Debug: check if URI is set (don't log full URI for security)
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is NOT set!');
    console.error('   Set it in Railway Variables tab.');
    return;
  }

  // Log sanitized URI (hide password)
  const sanitized = uri.replace(/:([^@]+)@/, ':****@');
  console.log(`🔗 Connecting to: ${sanitized}`);

  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i}/${retries} failed: ${error.message}`);
      if (i < retries) {
        console.log(`   Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.error('❌ All MongoDB connection attempts failed. Server will run without DB.');
      }
    }
  }
};

module.exports = connectDB;

