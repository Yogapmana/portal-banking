const express = require("express");
const cors = require("cors");
const { config, validateConfig } = require("./config");
const { connectDatabase } = require("./config/database");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Import routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const callLogRoutes = require("./routes/callLogs");

const app = express();

/**
 * Apply middleware
 */
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/call-logs", callLogRoutes);

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    environment: config.server.env,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Root endpoint
 */
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Portal Banking API",
    version: "2.0.0",
    documentation: "/api/docs",
  });
});

/**
 * 404 handler (must be before error handler)
 */
app.use(notFoundHandler);

/**
 * Global error handler (must be last)
 */
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async () => {
  try {
    validateConfig();

    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.server.port, () => {
      console.log(`Server running at: http://localhost:${config.server.port}`);
      console.log(`Environment: ${config.server.env}`);
      console.log(`Started at: ${new Date().toLocaleString()}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error("Error:", error.message);

    if (error.message.includes("environment variables")) {
      console.error("Setup Instructions:");
      console.error("1. Create .env file in backend directory");
      console.error("2. Add these variables:");
      console.error("   DATABASE_URL=your-database-connection-string");
      console.error("   JWT_SECRET=your-very-secure-secret-key-here");
    }

    process.exit(1);
  }
};

/**
 * Handle graceful shutdown
 */
process.on("SIGTERM", () => {
  console.log("");
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("");
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
