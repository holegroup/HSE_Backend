const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        // Test MongoDB connection
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connection successful');
        
        // Test basic server configuration
        console.log('Environment Variables:');
        console.log('- PORT:', process.env.PORT || 5000);
        console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
        console.log('- MongoDB URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
        console.log('- JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
        
        // Close connection
        await mongoose.connection.close();
        console.log('Connection test completed');
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }
}

testConnection();