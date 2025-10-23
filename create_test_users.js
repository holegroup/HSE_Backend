require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Inline user schema to avoid import path issues
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['inspector','supervisor','superadmin'], required: true },
  profile_img: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hse_buddy_local';

  const testUsers = [
    {
      name: 'Test Inspector',
      email: 'inspector@gmail.com',
      password: 'inspector123',
      role: 'inspector'
    },
    {
      name: 'Test Supervisor',
      email: 'supervisor@gmail.com',
      password: 'supervisor123',
      role: 'supervisor'
    },
    {
      name: 'John Inspector',
      email: 'john@inspector.com',
      password: 'password123',
      role: 'inspector'
    }
  ];

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    for (const userData of testUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(userData.password, salt);

      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashed,
        role: userData.role
      });
      
      await user.save();
      console.log(`🎉 Created ${userData.role}: ${userData.email} / ${userData.password}`);
    }

  } catch (e) {
    console.error('❌ Error creating test users:', e.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

createTestUsers();
