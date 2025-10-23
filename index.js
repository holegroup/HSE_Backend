require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const schedule = require("node-schedule");

// utils
const { updateTaskStatus, handleRecurringTask } = require("./utils/taskAutoUpdater");

// routes
const userRoutes = require("./routes/userRoutes");
const inspectionFormRoutes = require("./routes/inspectionFormRoutes");
const productRoutes = require("./routes/productRoutes");
const siteRoutes = require("./routes/siteRoute");
const taskRoutes = require("./routes/taskRoutes");
const sseRoutes = require('./routes/sseRoutes'); 

// cors
const cors = require("cors");
const bodyParser = require("body-parser");


app.get("/", (req, res) => {
    res.send("HSE Buddy Backend Server is running on http://localhost:" + PORT);
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        // Set CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        // Get MongoDB connection status
        let dbState = 0;
        let dbConnected = false;
        
        if (mongoose && mongoose.connection) {
            dbState = mongoose.connection.readyState;
            dbConnected = dbState === 1;
        }

        const dbStatus = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };

        // Send response
        res.status(200).json({
            success: true,
            status: "OK",
            message: "HSE Buddy API is healthy",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            port: PORT,
            database: {
                status: dbStatus[dbState] || "unknown",
                connected: dbConnected,
                uri: process.env.MONGO_URI ? "configured" : "not configured"
            },
            server: {
                uptime: process.uptime()
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        // Set CORS headers even for error responses
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        res.status(500).json({
            success: false,
            status: "ERROR",
            message: "Health check failed",
            error: error.message || "Unknown error occurred"
        });
    }
});

// API info endpoint
app.get("/api", (req, res) => {
    res.json({
        message: "HSE Buddy API",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            users: "/api/users",
            login: "/api/users/login",
            forms: "/api/forms",
            products: "/api/products",
            sites: "/api/sites",
            tasks: "/api/tasks"
        },
        documentation: "Available endpoints for HSE Buddy application"
    });
});

// middlewares for server
app.use(cors({
    origin: [
        'http://localhost:55368', 
        'http://localhost:3000', 
        'http://localhost:5000',
        'http://localhost:52605',
        'http://localhost:56789',
        'http://localhost:8080',
        /^http:\/\/localhost:\d+$/  // Allow any localhost port
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Add custom CORS headers for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(bodyParser.json());

// connecting to db
(async () => {
    try {
        await connectDB();
        console.log('Database connection initialized');
    } catch (error) {
        console.error('Failed to initialize database connection:', error);
    }
})();

// defining the routes
// user routes
app.use("/api/users", userRoutes);

// inspection form routes
app.use("/api/forms", inspectionFormRoutes);

// product routes
app.use("/api/products", productRoutes);

// site routes
app.use("/api/sites", siteRoutes);

// task routes
app.use("/api/tasks", taskRoutes);

// sse routes
app.use("/api/sse", sseRoutes); 


// job scheduling (update task status)
// schedule.scheduleJob("*/2 * * * *", async () => {
//     updateTaskStatus();
//     handleRecurringTask();
// });
schedule.scheduleJob("0 0 * * *", async () => {
    updateTaskStatus();
    handleRecurringTask();
});

app.get("/testing", (req, res) => {
    res.send("<h1>Hello Subhankar</h1>");
})
app.get("/server", (req, res) => {
    res.send("<h2>This is a testing server HSE Flutter APP with auth log-in and auth reg-in</h2>");
})

app.listen(PORT, () => {
    console.log(`:server is listening in port ${PORT}`);
})
