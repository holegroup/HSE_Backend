require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hse_buddy_local';
  console.log('Trying to connect to:', uri);
  try {
    const start = Date.now();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const ms = Date.now() - start;
    console.log('✅ Connected to MongoDB in', ms, 'ms');

    // simple ping
    const admin = mongoose.connection.db.admin();
    const ping = await admin.ping();
    console.log('Ping result:', ping);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(()=>{});
  }
})();
