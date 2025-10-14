require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
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
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "HSE Buddy API is healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        port: PORT,
        mongodb: process.env.MONGO_URI
    });
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
console.log("Here")
app.use(bodyParser.json());
app.use(cors());

// connecting to db
connectDB();

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
