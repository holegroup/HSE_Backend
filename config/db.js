const mongoose = require("mongoose"); 
require("dotenv").config(); 

async function connectDb(){ 
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGO_URI, options);
        console.log("Connected to MongoDB successfully");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Don't exit the process, let the application handle the error
        throw error;
    }
}

module.exports = connectDb;