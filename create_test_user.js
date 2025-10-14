require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// User model schema (inline for simplicity)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['inspector', 'supervisor'], required: true },
  profile_img: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/hse_buddy_local";
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        // Test users to create
        const testUsers = [
            {
                name: "Admin Inspector",
                email: "admin@hsebuddy.com",
                password: "admin123",
                role: "inspector"
            },
            {
                name: "Test Supervisor",
                email: "supervisor@hsebuddy.com", 
                password: "supervisor123",
                role: "supervisor"
            },
            {
                name: "John Inspector",
                email: "john@hsebuddy.com",
                password: "john123",
                role: "inspector"
            }
        ];

        console.log("🔄 Creating test users...");

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`⚠️  User ${userData.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Create user
            const user = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role
            });

            await user.save();
            console.log(`✅ Created ${userData.role}: ${userData.email} (password: ${userData.password})`);
        }

        console.log("\n🎉 Test users created successfully!");
        console.log("\n📱 You can now login with:");
        console.log("👤 Inspector - Email: admin@hsebuddy.com, Password: admin123");
        console.log("👔 Supervisor - Email: supervisor@hsebuddy.com, Password: supervisor123");
        console.log("👤 Inspector - Email: john@hsebuddy.com, Password: john123");

    } catch (error) {
        console.error("❌ Error creating test users:", error);
    } finally {
        await mongoose.disconnect();
        console.log("📤 Disconnected from MongoDB");
        process.exit(0);
    }
}

createTestUsers();
