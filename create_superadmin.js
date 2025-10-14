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

async function createSuperAdmin() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hse_buddy_local';
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';
  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@hsebuddy.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'superadmin123';

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`⚠️  Superadmin already exists: ${email}`);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed, role: 'superadmin' });
    await user.save();

    console.log('🎉 Superadmin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (e) {
    console.error('❌ Error creating superadmin:', e.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

createSuperAdmin();
