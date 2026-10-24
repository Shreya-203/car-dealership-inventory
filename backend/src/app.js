const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize the database.
require("./config/database");

// Authentication routes.
app.use("/api/auth", require("./routes/authRoutes"));

// Vehicle routes.
app.use("/api/vehicles", require("./routes/vehicleRoutes"));

// Health check.
app.get("/api/health", (req, res) => {
res.status(200).json({
status: "success",
message: "Car Dealership API is running",
});
});

// Centralized error handler.
app.use((err, req, res, next) => {
console.error("API ERROR:", err);

const status = err.status || 500;

res.status(status).json({
message: status === 500
? "Internal server error"
: err.message,
});
});

module.exports = app;
