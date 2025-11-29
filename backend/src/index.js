const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const { config, validateConfig } = require("./config");
const { connectDatabase } = require("./config/database");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const { sanitizeMiddleware } = require("./middleware/sanitize");

// Import routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const callLogRoutes = require("./routes/callLogs");
const conversationGuideRoutes = require("./routes/conversationGuide");

const app = express();

/**
 * Security middleware - Must be first
 */
// Helmet - Set security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for development
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
  })
);

// Trust proxy - Important for rate limiting and IP detection behind reverse proxy
app.set("trust proxy", 1);

/**
 * Apply middleware
 */
app.use(cors(config.cors));

// Body parsing with size limits
app.use(express.json({ limit: "10mb" })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // Parse cookies

// Custom sanitization middleware (Express v5 compatible)
// Prevents NoSQL injection, XSS, and prototype pollution
app.use(sanitizeMiddleware());

// Response compression - compress responses larger than 1kb
app.use(
  compression({
    threshold: 1024, // Only compress responses larger than 1kb
    level: 6, // Compression level (0-9, 6 is default)
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Use compression for all requests
      return compression.filter(req, res);
    },
  })
);

/**
 * Apply general API rate limiting to all /api routes
 * Individual routes can have their own stricter limiters
 */
app.use("/api", apiLimiter);

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/call-logs", callLogRoutes);
app.use("/api/conversation-guide", conversationGuideRoutes);

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
    version: "1.0.0",
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

    // Initialize Redis cache (optional - graceful fallback)
    const container = require("./container");
    const redisService = container.get("redisService");
    if (redisService) {
      await redisService.connect();
    }

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
