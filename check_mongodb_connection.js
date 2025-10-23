require('dotenv').config();
const mongoose = require('mongoose');

async function checkMongoDBConnection() {
    console.log('========================================');
    console.log('MongoDB Connection Status Check');
    console.log('========================================\n');
    
    // Check if MONGO_URI is configured
    if (!process.env.MONGO_URI) {
        console.log('❌ ERROR: MONGO_URI is not configured in .env file');
        console.log('Please add MONGO_URI to your .env file');
        return;
    }
    
    console.log('✅ MONGO_URI is configured');
    console.log(`📍 Connection string: ${process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<username>:<password>@')}\n`);
    
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        
        // Connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000,
        };
        
        // Attempt connection
        await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log('✅ Successfully connected to MongoDB!\n');
        
        // Get connection details
        const db = mongoose.connection.db;
        const admin = db.admin();
        
        // Get server status
        const serverStatus = await admin.serverStatus();
        console.log('📊 Database Information:');
        console.log(`   - Host: ${serverStatus.host || 'N/A'}`);
        console.log(`   - Version: ${serverStatus.version || 'N/A'}`);
        console.log(`   - Uptime: ${serverStatus.uptime ? Math.floor(serverStatus.uptime / 60) + ' minutes' : 'N/A'}`);
        
        // List databases
        const dbs = await admin.listDatabases();
        console.log(`   - Total databases: ${dbs.databases.length}`);
        
        // Get current database info
        const dbName = db.databaseName;
        console.log(`   - Current database: ${dbName}`);
        
        // Count collections in current database
        const collections = await db.listCollections().toArray();
        console.log(`   - Collections in ${dbName}: ${collections.length}`);
        
        if (collections.length > 0) {
            console.log('\n📁 Collections:');
            for (const collection of collections) {
                const count = await db.collection(collection.name).countDocuments();
                console.log(`   - ${collection.name}: ${count} documents`);
            }
        }
        
        console.log('\n✅ MongoDB is properly connected and operational!');
        
    } catch (error) {
        console.log('\n❌ Failed to connect to MongoDB');
        console.log('Error details:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Make sure MongoDB is running');
            console.log('   2. Check if the connection string is correct');
            console.log('   3. Verify firewall settings');
        } else if (error.message.includes('authentication failed')) {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Check your MongoDB username and password');
            console.log('   2. Verify user has correct permissions');
        } else if (error.message.includes('getaddrinfo')) {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Check your internet connection');
            console.log('   2. Verify the MongoDB host address');
            console.log('   3. Check DNS settings');
        }
    } finally {
        // Close the connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n📤 Connection closed');
        }
        console.log('\n========================================');
    }
}

// Run the check
checkMongoDBConnection();
